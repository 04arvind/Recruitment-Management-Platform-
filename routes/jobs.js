const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth, isApplicant } = require('../middleware/auth');

// GET /jobs - Get all job openings (All authenticated users)
router.get('/jobs', auth, jobController.getAllJobs);

// GET /jobs/apply - Apply to a job (Applicants only)
router.get('/jobs/apply', auth, isApplicant, jobController.applyToJobs);

module.exports = router;