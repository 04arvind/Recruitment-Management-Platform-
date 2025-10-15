const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { auth, isApplicant } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /uploadResume - Upload resume (Applicants only)
router.post('/uploadResume', auth, isApplicant, upload.single('resume'), resumeController.uploadResume);

module.exports = router;