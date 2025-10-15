const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title:{
        type : String,
        required : true
    },
    description:{
        type: String,
        required: true
    },
    postedOn : {
        type : Date,
        default: Date.now
    },
    totalApplications :{
        type : Number,
        default: 0
    },
    companyName : {
        type : String,
        required: true
    },
    postedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    applicants : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},{
    timestamps : true
});

module.exports = mongoose.model('Job',jobSchema);