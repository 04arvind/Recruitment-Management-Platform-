const Job = require('../models/Job');

exports.getAllJobs = async(req,res)=>{
    try {
        const jobs = await Job.find()
        .populate('postedBy','name email  companyName')
        .sort({postedOn : -1 });

        res.status(200).json({
        success:true,
        data:{
            jobs,
            total:jobs.length
        }
    });
    } catch (error) {
       console.error('Get all jobs error : ',error);
       res.status(500).json({
        success:false,
        message:'Error Fetching jobs',
        error:error.message
       });
    }
};

exports.applyToJobs = async(req,res)=>{
    try {
        const { job_id } = req.query;
        if(!job_id){
            return res.status(400).json({
                success:false,
                message:'Job ID is required'
            });
        }
        const job = await Job.findById(job_id);
        if(!job){
            return res.status(404).json({
                success: false,
                message:'Job not found'
            });
        }
        if(job.applicants.includes(req.UserId)){
            return res.status(400).json({
                success:false,
                message:'You have already applied to this job'
            });
        }
        job.applicants.push(req.UserId);
        job.totalApplications = job.applicants.length;
        await job.save();

        res.status(200).json({
            success:true,
            message:'Successfully applied to job',
            data:{
                jobId:job._id,
                jobTitle:job.title,
                totalApplications:job.totalApplications
            }
        });
    } catch (error) {
        console.error('Apply to job error : ',error);
        res.status(500).json({
            success:false,
            message:'Error applying to job',
            error:error.message
        });
    }
};