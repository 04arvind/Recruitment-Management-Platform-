const axios = require('axios');
const fs = require('fs');
const Profile = require('../models/Profile');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Call resume parser API
    try {
      const response = await axios.post(
        process.env.RESUME_PARSER_API_URL,
        fileBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'apikey': process.env.RESUME_PARSER_API_KEY
          }
        }
      );

      const parsedData = response.data;

      // Find or create profile for the applicant
      let profile = await Profile.findOne({ applicant: req.userId });
      
      if (!profile) {
        profile = new Profile({ applicant: req.userId });
      }

      // Update profile with parsed data
      profile.resumeFileAddress = filePath;
      profile.name = parsedData.name || profile.name;
      profile.email = parsedData.email || profile.email;
      profile.phone = parsedData.phone || profile.phone;

      // Convert arrays to strings
      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        profile.skills = parsedData.skills.join(', ');
      }

      if (parsedData.education && Array.isArray(parsedData.education)) {
        profile.education = parsedData.education.map(edu => edu.name || '').join(', ');
      }

      if (parsedData.experience && Array.isArray(parsedData.experience)) {
        profile.experience = parsedData.experience.map(exp => {
          const dates = exp.dates ? exp.dates.join(' - ') : '';
          return `${exp.name || ''} (${dates})`;
        }).join(', ');
      }

      await profile.save();

      res.status(200).json({ 
        success: true, 
        message: 'Resume uploaded and processed successfully',
        data: {
          profile: {
            resumeFileAddress: profile.resumeFileAddress,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            skills: profile.skills,
            education: profile.education,
            experience: profile.experience
          }
        }
      });
    } catch (apiError) {
      console.error('Resume parser API error:', apiError.response?.data || apiError.message);
      
      // Save file address even if API fails
      let profile = await Profile.findOne({ applicant: req.userId });
      if (!profile) {
        profile = new Profile({ applicant: req.userId });
      }
      profile.resumeFileAddress = filePath;
      await profile.save();

      res.status(200).json({ 
        success: true, 
        message: 'Resume uploaded but parsing failed. File saved successfully.',
        data: {
          profile: {
            resumeFileAddress: profile.resumeFileAddress
          }
        },
        warning: 'Resume parsing API error'
      });
    }
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading resume', 
      error: error.message 
    });
  }
};