const Job = require('../models/Job');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { screenAllCandidates } = require('../server/geminiScreeningService.js');
const mongoose = require('mongoose');

exports.createJob = async (req, res) => {
  try {
    const { title, description, companyName } = req.body;

    if (!title || !description || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and company name are required',
      });
    }

    const job = new Job({
      title,
      description,
      companyName,
      postedBy: req.user._id,
    });
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          postedOn: job.postedOn,
          totalApplications: job.totalApplications,
        },
      },
    });
  } catch (error) {
    console.error('Create job error : ', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { job_id } = req.params;
    const job = await Job.findById(job_id)
      .populate('postedBy', 'name email')
      .populate('applicants', 'name email profileHeadline');
      // .populate('applicants', 'name email profileHeadline');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          postedOn: job.postedOn,
          totalApplications: job.totalApplications,
          postedBy: job.postedBy,
          applicants: job.applicants,
        },
      },
    });
  } catch (error) {
    console.error('Get job error : ', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message,
    });
  }
};


exports.getAllApplicants = async (req, res) => {
  try {
    const { job_id } = req.query;

    let applicantUsers;

    if (job_id) {
      // Query the Job directly to get its applicants
      const job = await Job.findById(job_id).populate('applicants', '-passwordHash');

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      // Get profiles for all applicants
      const applicantIds = job.applicants.map((user) => user._id);
      const profiles = await Profile.find({
        applicant: { $in: applicantIds },
      });

      // Build lookup: applicant id → profile
      const profileMap = {};
      profiles.forEach((p) => {
        profileMap[p.applicant.toString()] = p;
      });

      applicantUsers = job.applicants.map((user) => {
        const profile = profileMap[user._id.toString()];
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profileId: profile?._id || null,
          profileHeadline: profile?.profileHeadline || null,
          address: profile?.address || null,
          skills: profile?.skills || [],
          experience: profile?.experience || [],
          education: profile?.education || [],
          hasResume: !!(
            profile?.resumeData?.rawText || profile?.resumeData?.filePath
          ),
          resumeFileName: profile?.resumeData?.fileName || null,
          appliedJobsCount: profile?.appliedJobs?.length || 0,
          aiScreening: profile?.aiScreening
            ? Object.fromEntries(profile.aiScreening)
            : {},
        };
      });
    } else {
      // All applicants — join with their profiles
      const users = await User.find({ userType: 'Applicant' }).select(
        '-passwordHash'
      );

      const profiles = await Profile.find({
        applicant: { $in: users.map((u) => u._id) },
      });

      // Build a quick lookup: applicant id → profile
      const profileMap = {};
      profiles.forEach((p) => {
        profileMap[p.applicant.toString()] = p;
      });

      applicantUsers = users.map((user) => {
        const profile = profileMap[user._id.toString()];
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profileId: profile?._id || null,
          profileHeadline: profile?.profileHeadline || null,
          address: profile?.address || null,
          skills: profile?.skills || [],
          experience: profile?.experience || [],
          education: profile?.education || [],
          hasResume: !!(
            profile?.resumeData?.rawText || profile?.resumeData?.filePath
          ),
          resumeFileName: profile?.resumeData?.fileName || null,
          appliedJobsCount: profile?.appliedJobs?.length || 0,
          aiScreening: profile?.aiScreening
            ? Object.fromEntries(profile.aiScreening)
            : {},
        };
      });
    }

    res.status(200).json({
      success: true,
      data: {
        applicants: applicantUsers,
        total: applicantUsers.length,
      },
    });
  } catch (error) {
    console.error('Get all applicants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applicants',
      error: error.message,
    });
  }
};


exports.getApplicantById = async (req, res) => {
  try {
    const { applicant_id } = req.params;

    const user = await User.findById(applicant_id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    if (user.userType !== 'Applicant') {
      return res.status(400).json({
        success: false,
        message: 'User is not an applicant',
      });
    }

    // Note: your schema uses 'applicant' field (not 'userId')
    const profile = await Profile.findOne({
      applicant: applicant_id,
    }).populate('appliedJobs', 'title companyName description');

    // Build aiScreeningResults: one entry per job applied to
    let aiScreeningResults = {};
    if (profile?.appliedJobs?.length) {
      for (const job of profile.appliedJobs) {
        const jobId = job._id.toString();
        const saved = profile.aiScreening?.get(jobId);
        aiScreeningResults[jobId] = {
          jobTitle: job.title,
          companyName: job.companyName,
          ...(saved
            ? saved.toObject()
            : { note: 'Not yet screened for this job' }),
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile: profile
          ? {
              _id: profile._id,
              profileHeadline: profile.profileHeadline,
              address: profile.address,
              skills: profile.skills || [],
              experience: profile.experience || [],
              education: profile.education || [],
              hasResume: !!(
                profile.resumeData?.rawText || profile.resumeData?.filePath
              ),
              resumeFileName: profile.resumeData?.fileName || null,
              resumeUploadedAt: profile.resumeData?.uploadedAt || null,
              appliedJobsCount: profile.appliedJobs?.length || 0,
              appliedJobs: profile.appliedJobs,
              aiScreeningResults,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get applicant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applicant',
      error: error.message,
    });
  }
};

exports.screenApplicantsForJob = async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: 'job_id is required in request body',
      });
    }

    const job = await Job.findById(job_id).populate('applicants', '-passwordHash');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!job.applicants.length) {
      return res.status(200).json({
        success: true,
        message: 'No applicants found for this job',
        data: { results: [] },
      });
    }

    // Get profiles for all applicants
    const applicantIds = job.applicants.map((user) => user._id);
    const profiles = await Profile.find({
      applicant: { $in: applicantIds },
    });

    // Build a lookup: applicant id → profile
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.applicant.toString()] = p;
    });

    // Build the candidate list for Gemini
    const candidates = job.applicants.map((user) => {
      const profile = profileMap[user._id.toString()];
      return {
        id: profile?._id.toString() || user._id.toString(),
        name: user.name || 'Unknown',
        email: user.email || '',
        skills: profile?.skills || '',
        experience: profile?.experience || '',
        education: profile?.education || '',
        resumeText: profile?.resumeFileAddress || '',
      };
    }).filter(c => c); // Remove nulls

    const jobDescription = `Title: ${job.title}\nCompany: ${job.companyName}\nDescription: ${job.description}`;

    // Call Gemini AI — runs all candidates in parallel
    const results = await screenAllCandidates(jobDescription, candidates);

    // Save each result back to the profile in MongoDB
    for (const result of results) {
      await Profile.findByIdAndUpdate(result.candidateId, {
        $set: {
          [`aiScreening.${job_id}`]: {
            score: result.score,
            strengths: result.strengths,
            gaps: result.gaps,
            recommendation: result.recommendation,
            summary: result.summary,
            rank: result.rank,
            screenedAt: new Date(),
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'AI Screening complete',
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.companyName,
        },
        totalScreened: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('AI Screening error:', error);
    res.status(500).json({
      success: false,
      message: 'Screening failed',
      error: error.message,
    });
  }
};

exports.getScreeningResults = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await Job.findById(job_id).populate('applicants', '-passwordHash');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!job.applicants.length) {
      return res.status(200).json({
        success: true,
        data: {
          job: {
            id: job._id,
            title: job.title,
            company: job.companyName,
          },
          totalResults: 0,
          results: [],
        },
      });
    }

    // Get profiles for all applicants
    const applicantIds = job.applicants.map((user) => user._id);
    const profiles = await Profile.find({
      applicant: { $in: applicantIds },
    });

    // Build a lookup: applicant id → profile
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.applicant.toString()] = p;
    });

    // Only include applicants that have a saved screening result for this job
    const results = job.applicants
      .map((user) => {
        const profile = profileMap[user._id.toString()];
        if (!profile?.aiScreening?.has(job_id)) {
          return null;
        }
        
        const screening = profile.aiScreening.get(job_id);
        return {
          candidateId: profile._id,
          candidateName: user.name,
          email: user.email,
          profileHeadline: profile.profileHeadline,
          score: screening.score,
          strengths: screening.strengths,
          gaps: screening.gaps,
          recommendation: screening.recommendation,
          summary: screening.summary,
          rank: screening.rank,
          screenedAt: screening.screenedAt,
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999));

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.companyName,
        },
        totalResults: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('Get screening results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching screening results',
      error: error.message,
    });
  }
};