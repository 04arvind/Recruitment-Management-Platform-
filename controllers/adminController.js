const Job = require('../models/Job');
const User = require('../models/User');
const Profile = require('../models/Profile');

exports.createJob = async(req,res)=>{
    try {
        const {title, description, companyName} = req.body;

        if(!title || !description || !companyName ) {
            return res.status(400).json({
                success:false,
                message:'Title, description and company name are required'
            });
        }
        const job = new Job({
            title,
            description,
            companyName,
            postedBy: req.user._id
            // postedBy: req.UserId
        });
        await job.save();

        res.status(201).json({
            success:true,
            message:'Job created successfully',
            data:{
                job:{
                    id:job._id,
                    title:job.title,
                    description : job.description,
                    companyName: job.companyName,
                    postedOn : job.postedOn,
                    totalApplications: job.totalApplications
                }
            }
        });

    } catch (error) {
        console.error('Create job error : ',error);
        res.status(500).json({
            success:false,
            message:'Error creating job',
            error : error.message
        });
    }
};


exports.getJobById = async(req,res)=>{
    try {
        const {job_id} = req.params;
        const job = await Job.findById(job_id)
        .populate('postedBy', 'name email')
        .populate('applications','name email profileHeadline');

        if(!job){
            return res.status(404).json({
                success:false,
                message:'Job not found'
            });
        }
        res.status(200).json({
            success:true,
            data:{
                job:{
                    id:job._id,
                    title: job.title,
                    description: job.description,
                    companyName: job.companyName,
                    postedOn: job.postedOn,
                    totalApplications: job.totalApplications,
                    postedBy: job.postedBy,
                    applicants: job.applicants
                }
            }
        });
    } catch (error) {
        console.error('Get job error : ', error);
        res.status(500).json({
            success:false,
            message: 'Error fetching job',
            error:error.message
        });
    }
};

exports.getAllApplicants = async(req,res)=>{
    try {
        const applicants = await User.find({ userType: 'Applicant' })
        .select('-passwordHash');

      res.status(200).json({ 
      success: true, 
      data: {
        applicants,
        total: applicants.length
      }
    });

    } catch (error) {
        console.error('Get all applicants error:', error);
       res.status(500).json({ 
      success: false, 
      message: 'Error fetching applicants', 
      error: error.message 
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
        message: 'Applicant not found' 
      });
    }

    if (user.userType !== 'Applicant') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not an applicant' 
      });
    }

    const profile = await Profile.findOne({ applicant: applicant_id });

    res.status(200).json({ 
      success: true, 
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Get applicant error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applicant', 
      error: error.message 
    });
  }
};