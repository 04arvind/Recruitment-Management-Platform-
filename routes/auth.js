const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /signup - Create a new user
router.post('/signup', authController.signup);

// POST /login - Authenticate user
router.post('/login', authController.login);

module.exports = router;