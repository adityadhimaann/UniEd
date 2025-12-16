# UniEd Backend - Quick Start Guide

## ✅ What's Been Created

### Core Infrastructure
- ✅ Express.js application setup
- ✅ MongoDB connection with Mongoose
- ✅ Redis connection (optional)
- ✅ Cloudinary configuration
- ✅ Environment variables setup

### Database Models (9 Models)
- ✅ User (with authentication)
- ✅ Course
- ✅ Enrollment
- ✅ Assignment
- ✅ Grade
- ✅ Attendance
- ✅ Announcement
- ✅ Message
- ✅ Notification

### Security & Middleware
- ✅ JWT authentication (Access + Refresh tokens)
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Joi)
- ✅ Error handling
- ✅ Rate limiting
- ✅ File upload handling (Multer)
- ✅ CORS, Helmet, Compression

### Authentication System
- ✅ Register endpoint
- ✅ Login endpoint
- ✅ Logout endpoint
- ✅ Refresh token endpoint
- ✅ Get profile endpoint
- ✅ Password hashing with bcrypt

## 🚀 Getting Started

### 1. Install Dependencies (Already Done)
```bash
cd backend
npm install
```

### 2. Start MongoDB
```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### 3. Start Redis (Optional)
```bash
# Using Homebrew (macOS)
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 --name redis redis
```

### 4. Configure Environment
The `.env` file is already created. Update these values if needed:
- `JWT_SECRET`: Change to a secure random string
- `JWT_REFRESH_SECRET`: Change to a different secure random string
- Cloudinary credentials (if using file uploads)
- Email credentials (for notifications)

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: **http://localhost:5001**

## 🧪 Test the API

### Option 1: Using the HTTP File
1. Open `api-tests.http` in VS Code
2. Install "REST Client" extension
3. Click "Send Request" above each request

### Option 2: Using cURL

```bash
# Health Check
curl http://localhost:5001/health

# Register a student
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@unied.com",
    "password": "password123",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU001",
    "department": "Computer Science",
    "semester": 1
  }'

# Login
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@unied.com",
    "password": "password123"
  }'

# Save the accessToken from login response, then:
curl http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Option 3: Using Postman/Insomnia
Import the requests from `api-tests.http`

## 📝 Current Features

### ✅ Implemented
- User registration with role-based signup
- User login with JWT tokens
- Token refresh mechanism
- User profile retrieval
- Password hashing
- Input validation
- Error handling
- Rate limiting
- CORS configuration

### 🔜 Coming Next
- User management endpoints
- Course CRUD operations
- Assignment management
- Grade tracking
- Attendance marking
- Announcements
- Messaging system
- File uploads
- Email notifications
- Analytics dashboard
- Socket.io real-time features

## 🎯 Next Steps

1. **Test Authentication**
   - Register users with different roles (student, faculty, admin)
   - Login and get tokens
   - Test protected routes

2. **Create Additional Controllers**
   - User controller (CRUD operations)
   - Course controller
   - Assignment controller
   - etc.

3. **Add Socket.io**
   - Real-time notifications
   - Live messaging
   - Attendance updates

4. **Implement Email Service**
   - Email verification
   - Password reset
   - Notifications

5. **Add Tests**
   - Unit tests
   - Integration tests
   - API tests

## 🔍 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
brew services list | grep mongodb

# Or check with mongosh
mongosh
```

### Port Already in Use
```bash
# Find process using port 5001
lsof -ti:5001

# Kill the process
kill -9 $(lsof -ti:5001)
```

### Redis Connection Error
- Redis is optional, the app will continue without it
- To install: `brew install redis`
- To start: `brew services start redis`

## 📊 Database Schema Overview

```
Users (Authentication & Profiles)
  ↓
Courses (Course Management)
  ↓
├── Enrollments (Student-Course Links)
├── Assignments (with Submissions)
├── Grades (with Assessments)
├── Attendance (Daily Records)
└── Announcements (Course-specific)

Messages (P2P Communication)
Notifications (User Alerts)
```

## 🔐 JWT Token Flow

```
1. User Login
   ↓
2. Generate Access Token (15 min) + Refresh Token (7 days)
   ↓
3. Store Refresh Token in DB
   ↓
4. Return both tokens to client
   ↓
5. Client uses Access Token for API requests
   ↓
6. When Access Token expires, use Refresh Token to get new one
   ↓
7. On Logout, clear Refresh Token from DB
```

## 📱 Frontend Integration

Update your frontend to use:
```javascript
const API_URL = 'http://localhost:5001/api/v1';
```

Example login:
```javascript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
// data.accessToken
// data.refreshToken
// data.user
```

## 🎉 You're All Set!

Your backend is now running with:
- ✅ Authentication system
- ✅ Database models
- ✅ Security middleware
- ✅ Error handling
- ✅ API documentation

Ready to build the rest of the features! 🚀
