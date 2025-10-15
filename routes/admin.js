const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/job', auth, isAdmin, adminController.createJob);

router.get('/job/:job_id', auth, isAdmin, adminController.getJobById);

router.get('/applicants', auth, isAdmin, adminController.getAllApplicants);

router.get('/applicant/:applicant_id', auth, isAdmin, adminController.getApplicantById);

module.exports = router;