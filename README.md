# Recruitment Management System - Backend

A complete backend system for managing recruitment processes with resume parsing, job postings, and application management.

## Features

- User authentication (Admin & Applicant roles)
- Resume upload and parsing using third-party API
- Job posting management (Admin)
- Job application system
- Applicant profile management

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Axios** for API calls

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn package manager

## Installation Steps

### 1. Clone or Create the Project

```bash
mkdir recruitment-system
cd recruitment-system
```

### 2. Copy all the provided files into their respective folders

Make sure your folder structure looks like this:

```
recruitment-system/
├── config/
├── models/
│   ├── User.js
│   ├── Profile.js
│   └── Job.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── routes/
│   ├── auth.js
│   ├── resume.js
│   ├── admin.js
│   └── jobs.js
├── controllers/
│   ├── authController.js
│   ├── resumeController.js
│   ├── adminController.js
│   └── jobController.js
├── uploads/
├── .env
├── .gitignore
├── package.json
└── server.js
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup MongoDB

**Option A: Local MongoDB**

- Install MongoDB locally
- Make sure MongoDB service is running
- Use the default connection string in `.env`

**Option B: MongoDB Atlas (Cloud)**

- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get your connection string
- Update `MONGODB_URI` in `.env` file

### 5. Configure Environment Variables

Edit the `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recruitment-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
RESUME_PARSER_API_KEY=0bWeisRWoLalksf5145MSMWp545erwinsdS
RESUME_PARSER_API_URL=https://api.erwin.com/erwin/upload
```

**Important:** Change `JWT_SECRET` to a random secure string!

### 6. Create Uploads Directory

```bash
mkdir uploads
```

### 7. Start the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication APIs

#### 1. Sign Up

- **URL:** `POST /api/signup`
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "Applicant",
  "profileHeadline": "Software Developer",
  "address": "123 Main St, City"
}
```

#### 2. Login

- **URL:** `POST /api/login`
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response:** Returns JWT token

### Applicant APIs

#### 3. Upload Resume

- **URL:** `POST /api/uploadResume`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Form-data with key `resume` and PDF/DOCX file
- **Access:** Applicants only

#### 4. View Jobs

- **URL:** `GET /api/jobs`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** All authenticated users

#### 5. Apply to Job

- **URL:** `GET /api/jobs/apply?job_id={job_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Applicants only

### Admin APIs

#### 6. Create Job

- **URL:** `POST /api/admin/job`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "title": "Senior Backend Developer",
  "description": "We are looking for an experienced backend developer...",
  "companyName": "Tech Corp"
}
```

- **Access:** Admin only

#### 7. Get Job Details

- **URL:** `GET /api/admin/job/{job_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

#### 8. Get All Applicants

- **URL:** `GET /api/admin/applicants`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

#### 9. Get Applicant Details

- **URL:** `GET /api/admin/applicant/{applicant_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

## Testing with Postman

### Step 1: Create Admin User

```
POST http://localhost:5000/api/signup
Body: {
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "userType": "Admin",
  "profileHeadline": "System Administrator",
  "address": "Admin Office, City"
}
```

### Step 2: Create Applicant User

```
POST http://localhost:5000/api/signup
Body: {
  "name": "Jane Applicant",
  "email": "jane@example.com",
  "password": "jane123",
  "userType": "Applicant",
  "profileHeadline": "Full Stack Developer",
  "address": "456 Dev Street, Tech City"
}
```

### Step 3: Login as Admin

```
POST http://localhost:5000/api/login
Body: {
  "email": "admin@example.com",
  "password": "admin123"
}
```

Copy the returned token.

### Step 4: Create a Job (as Admin)

```
POST http://localhost:5000/api/admin/job
Headers: Authorization: Bearer <admin_token>
Body: {
  "title": "Backend Developer",
  "description": "Looking for Node.js developer",
  "companyName": "Tech Solutions"
}
```

### Step 5: Login as Applicant

```
POST http://localhost:5000/api/login
Body: {
  "email": "jane@example.com",
  "password": "jane123"
}
```

Copy the returned token.

### Step 6: Upload Resume (as Applicant)

```
POST http://localhost:5000/api/uploadResume
Headers: Authorization: Bearer <applicant_token>
Body: form-data
  Key: resume
  Value: [Select PDF or DOCX file]
```

### Step 7: View Jobs (as Applicant)

```
GET http://localhost:5000/api/jobs
Headers: Authorization: Bearer <applicant_token>
```

### Step 8: Apply to Job (as Applicant)

```
GET http://localhost:5000/api/jobs/apply?job_id={job_id_from_step_4}
Headers: Authorization: Bearer <applicant_token>
```

### Step 9: View Applicants (as Admin)

```
GET http://localhost:5000/api/admin/applicants
Headers: Authorization: Bearer <admin_token>
```

## Project Structure Explained

- **server.js**: Main application entry point
- **models/**: MongoDB schema definitions
- **controllers/**: Business logic for each feature
- **routes/**: API endpoint definitions
- **middleware/**: Authentication and file upload handlers
- **uploads/**: Directory for storing uploaded resumes

## Common Issues & Solutions

### 1. MongoDB Connection Error

- Make sure MongoDB is running
- Check if connection string in `.env` is correct
- For MongoDB Atlas, whitelist your IP address

### 2. File Upload Issues

- Ensure `uploads/` directory exists
- Check file size (max 5MB)
- Only PDF and DOCX formats allowed

### 3. Resume Parser API Issues

- The free API may have rate limits
- Check if API key is valid
- File still saves even if parsing fails

### 4. JWT Token Issues

- Token expires in 7 days
- Include `Bearer ` prefix in Authorization header
- Format: `Authorization: Bearer <your_token>`

## Git Setup

```bash
git init
git add .
git commit -m "Initial commit: Recruitment Management System"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Security Notes

- Change `JWT_SECRET` in production
- Never commit `.env` file
- Use HTTPS in production
- Implement rate limiting for production
- Add input validation and sanitization
- Use environment-specific configurations

## Future Enhancements

- Email notifications
- Password reset functionality
- Advanced search and filters
- Resume download feature
- Application status tracking
- Interview scheduling

## License

MIT License

Copyright (c) 2025 Arvind Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
