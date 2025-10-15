const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


// Load environment variables
dotenv.config();


const authRoutes = require('./routes/auth');
// console.log('Auth routes:', authRoutes);

const resumeRoutes = require('./routes/resume');
// console.log('Resume routes:', resumeRoutes);

const adminRoutes = require('./routes/admin');
// console.log('Admin routes:', adminRoutes);

const jobRoutes = require('./routes/jobs.js');
// console.log('Job routes:', jobRoutes);

// Import routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment-system')
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', resumeRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', jobRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Recruitment Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});