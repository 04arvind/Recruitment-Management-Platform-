const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { application } = require('express');

exports.signup = async(req,res)=>{
    try {
        const {name, email, password, userType, profileHeadline, address} = req.body;

        if(!name || !email || !password || !userType || !profileHeadline || !address){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            });
        }

        if(!['Admin', 'Applicant'].includes(userType)){
            return res.status(400).json({
                success:false,
                message:'Invalid user type. Must be Admin or Applicant'
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User with this email '
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password,salt);

        const user = new User({
            name,
            email,
            address,
            userType,
            passwordHash,
            profileHeadline
        });
        await user.save();

        if(userType === 'Applicant'){
            const profile = new Profile({
                applicant : user._id,
                name:name,
                email:email
            });
            await profile.save();
        }

        res.status(201).json({
            success:true,
            message : 'User created successfully',
            data:{
                userId:user._id,
                name : user.name,
                email : user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Signup error: ',error);
        res.status(500).json({
            success:false,
            message:'Error creating user',
            error:error.message
        });
    }
};

exports.login = async(req,res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({
                success:false,
                message: 'Email and password are required'
            });
        }

    const user = await User.findOne({ email });
    if(!user ){
        return res.status(401).json({
            success:false,
            message:'Invalid email or password'
        });
    }

    const isPasswordVaid  = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordVaid){
        return res.status(401).json({
            success:false,
            message:'Invalid email or password'
        });
    }

    const token = jwt.sign({
        userId: user._id, userType:user.userType},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
    res.status(200).json({
        success:true,
        message:'Login successful',
        data : {
            token,
            user:{
                id: user._id,
                name:user.name,
                email: user.email,
                userType: user.userType
            }
        }
    });

    } catch (error) {
        console.error('Login error : ',error);
        res.status(500).json({
            success:false,
            message:'Error during login',
            error:error.message
        });
    }
};