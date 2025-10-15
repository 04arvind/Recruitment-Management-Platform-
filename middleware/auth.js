const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async(req,res,next)=>{
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token){
            return res.status(401).json({
                success:false,
                message:'No authentication token provided',
            });
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User not found',
            });
        }
        req.user = user;
        req.userId = user._id;
        req.userType = user.userType;
        next();
    } catch (error) {
        res.status(401).json({
            success:false,
            message:'Invalid or expired token'
        });
    }
};

const isAdmin = (req, res, next)=>{
    if(req.userType !== 'Admin'){
        return res.status(403).json({
            success:false,
            message:'Access denied. Admin only.'
        });
    }
    next();
};

const isApplicant = (req, res, next)=>{
    if(req.userType !== 'Applicant'){
        return res.status(403).json({
            success:false,
            message:'Access denied. Applicants only.'
        });
    }
    next();
};

module.exports = {auth, isAdmin, isApplicant};