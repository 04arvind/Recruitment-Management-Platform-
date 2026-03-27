const mongoose = require('mongoose');

const aiScreeningResultSchema = new mongoose.Schema({
    score: {type:Number, min:0, max:100},
    strengths : [{type:String}],
    gaps : [{type: String}],
    recommendations :{
        type: String,
        enum: ['String Fit', 'Moderate Fit', 'Not Fit'],
    },
    summary: { type: String},
    rank : {type:Number},
    screenedAt : {type : Date, default: Date.now},  
},
{_id:false}
);

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
    },
    // map of job_id (string)-> screening result
    appliedJobs:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Job'
        },
    ],
    aiScreening : {
        type:Map,
        of: aiScreeningResultSchema,
        default: {}
    },
},{
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);