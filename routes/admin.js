const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/job', auth, isAdmin, adminController.createJob);

router.get('/job/:job_id', auth, isAdmin, adminController.getJobById);

router.get('/applicants', auth, isAdmin, adminController.getAllApplicants);

router.get('/applicant/:applicant_id', auth, isAdmin, adminController.getApplicantById);

// run gemini ai screening for all applicants of a job
router.post('/screen',auth,isAdmin,adminController.screenApplicantsForJob);

// get saved screening results for a job(read form db, no gemini call)
router.get('/screen-results/:job_id',auth,isAdmin, adminController.getScreeningResults);

module.exports = router;