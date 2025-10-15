const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    applicant:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique: true
    },
    resumeFileAddress:{
        type: String,
        default: null
    },
    skills:{
        type:String,
        default:null
    },
    education : {
        type : String,
        default: null
    },
    experience : {
        type : String,
        default: null
    },
    name : {
        type : String,
        default : null
    },
    email : {
        type : String,
        default : null
    },
    phone : {
        type : String,
        default : null
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);