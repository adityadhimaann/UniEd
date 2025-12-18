# 🚀 Quick Start Guide - New Features

## Prerequisites
- MongoDB running on `localhost:27017`
- Backend server dependencies installed
- Node.js v18+

---

## Step 1: Start MongoDB

```bash
# Check if MongoDB is running
pgrep -x mongod

# If not running, start it (macOS)
brew services start mongodb-community

# Or manually
mongod --dbpath=/path/to/data/db
```

---

## Step 2: Test New Models

```bash
cd backend
node test-new-features.js
```

**Expected Output:**
```
🧪 Testing New Features...

📊 Connecting to MongoDB...
✅ Connected to MongoDB

1️⃣  Testing Quiz Model...
   ✅ Quiz model working - 0 quizzes in database

2️⃣  Testing Discussion Model...
   ✅ Discussion model working - 0 discussions in database

3️⃣  Testing LiveSession Model...
   ✅ LiveSession model working - 0 sessions in database

4️⃣  Testing Progress Model...
   ✅ Progress model working - 0 progress records in database

5️⃣  Testing Certificate Model...
   ✅ Certificate model working - 0 certificates in database

6️⃣  Testing CourseMaterial Model...
   ✅ CourseMaterial model working - 0 materials in database

🎉 All models are working correctly!

🔧 Testing Model Methods...
   Testing Progress.calculateProgress()...
   ✅ Progress calculation: 67%

✅ All tests passed!

📊 Summary:
   - Quiz Model: ✅
   - Discussion Model: ✅
   - LiveSession Model: ✅
   - Progress Model: ✅
   - Certificate Model: ✅
   - CourseMaterial Model: ✅

🚀 Backend is ready for new features!
```

---

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: localhost
✅ Socket.io initialized
🚀 Server running on port 5001
🌐 API URL: http://localhost:5001/api/v1
🔌 Socket.io: ws://localhost:5001
💚 Health Check: http://localhost:5001/health
```

---

## Step 4: Test API Endpoints

### Health Check
```bash
curl http://localhost:5001/health
```

### Get Your Access Token
First, login to get your token:
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `accessToken` from the response.

---

## Step 5: Test New Features

### 1. Create a Quiz (Faculty Only)

```bash
curl -X POST http://localhost:5001/api/v1/quizzes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "YOUR_COURSE_ID",
    "title": "Introduction Quiz",
    "description": "Test your knowledge",
    "questions": [
      {
        "type": "multiple-choice",
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4",
        "points": 10,
        "explanation": "Basic arithmetic"
      },
      {
        "type": "true-false",
        "question": "The sky is blue",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "points": 5
      }
    ],
    "passingScore": 60,
    "timeLimit": 30,
    "attemptsAllowed": 2,
    "shuffleQuestions": false,
    "showCorrectAnswers": true,
    "availableFrom": "2024-01-01T00:00:00Z",
    "availableUntil": "2024-12-31T23:59:59Z",
    "isPublished": true
  }'
```

### 2. Create a Discussion

```bash
curl -X POST http://localhost:5001/api/v1/discussions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "YOUR_COURSE_ID",
    "title": "Question about Assignment 1",
    "content": "I need help understanding question 3. Can someone explain?",
    "category": "question",
    "tags": ["assignment", "help"]
  }'
```

### 3. Schedule a Live Session (Faculty Only)

```bash
curl -X POST http://localhost:5001/api/v1/live-sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "YOUR_COURSE_ID",
    "title": "Week 1 Lecture - Introduction",
    "description": "Introduction to the course",
    "scheduledStart": "2024-01-15T10:00:00Z",
    "scheduledEnd": "2024-01-15T11:30:00Z",
    "platform": "zoom",
    "meetingLink": "https://zoom.us/j/123456789",
    "meetingId": "123 456 789",
    "meetingPassword": "abc123",
    "maxParticipants": 100,
    "agenda": "1. Course overview\n2. Syllabus review\n3. Q&A",
    "isRecorded": true
  }'
```

### 4. Get Student Progress

```bash
curl -X GET http://localhost:5001/api/v1/progress/course/YOUR_COURSE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Upload Course Material (Faculty Only)

```bash
curl -X POST http://localhost:5001/api/v1/materials \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "course=YOUR_COURSE_ID" \
  -F "title=Lecture 1 Slides" \
  -F "description=Introduction slides" \
  -F "type=presentation" \
  -F "category=lecture" \
  -F "module=Module 1" \
  -F "week=1" \
  -F "order=1" \
  -F "isPublished=true" \
  -F "accessLevel=enrolled" \
  -F "tags=lecture,introduction" \
  -F "file=@/path/to/your/file.pdf"
```

---

## Step 6: Test with Postman/Insomnia

### Import Collection

Create a new collection with these endpoints:

**Base URL:** `http://localhost:5001/api/v1`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Endpoints to test:**

#### Quizzes
- `POST /quizzes` - Create quiz
- `GET /quizzes/course/:courseId` - Get course quizzes
- `GET /quizzes/:quizId` - Get quiz details
- `POST /quizzes/:quizId/attempt` - Start attempt
- `POST /quizzes/:quizId/attempt/:attemptId/submit` - Submit attempt

#### Discussions
- `POST /discussions` - Create discussion
- `GET /discussions/course/:courseId` - Get discussions
- `POST /discussions/:discussionId/replies` - Add reply
- `POST /discussions/:discussionId/like` - Toggle like

#### Live Sessions
- `POST /live-sessions` - Create session
- `GET /live-sessions/course/:courseId` - Get sessions
- `POST /live-sessions/:sessionId/start` - Start session
- `POST /live-sessions/:sessionId/join` - Join session

#### Progress
- `GET /progress` - Get all progress
- `GET /progress/course/:courseId` - Get course progress
- `POST /progress/course/:courseId/module` - Update module

#### Materials
- `POST /materials` - Upload material
- `GET /materials/course/:courseId` - Get materials
- `GET /materials/course/:courseId/search?q=lecture` - Search

---

## Step 7: Verify Database

```bash
# Connect to MongoDB
mongosh

# Switch to database
use unied

# Check collections
show collections

# You should see:
# - quizzes
# - discussions
# - livesessions
# - progresses
# - certificates
# - coursematerials

# Count documents
db.quizzes.countDocuments()
db.discussions.countDocuments()
db.livesessions.countDocuments()
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Not Running
```bash
# Error: MongoServerError: connect ECONNREFUSED
# Solution: Start MongoDB
brew services start mongodb-community
```

### Issue 2: Port 5001 Already in Use
```bash
# Error: EADDRINUSE: address already in use :::5001
# Solution: Kill the process
lsof -ti:5001 | xargs kill -9
```

### Issue 3: Authentication Error
```bash
# Error: 401 Unauthorized
# Solution: Make sure you're using a valid access token
# Login again to get a fresh token
```

### Issue 4: Course Not Found
```bash
# Error: Course not found
# Solution: Create a course first using instructor endpoints
curl -X POST http://localhost:5001/api/v1/instructor/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Introduction to Computer Science",
    "description": "Learn the basics",
    "credits": 3,
    "department": "Computer Science",
    "semester": 1
  }'
```

---

## Testing Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Test script runs successfully
- [ ] Health endpoint returns OK
- [ ] Can create a quiz
- [ ] Can create a discussion
- [ ] Can schedule a live session
- [ ] Can view progress
- [ ] Can upload materials
- [ ] All models are in database
- [ ] Socket.IO is connected

---

## Next Steps

1. ✅ Test all endpoints with Postman
2. ✅ Create sample data for each feature
3. ✅ Test role-based permissions
4. ✅ Verify real-time notifications
5. 🔜 Build frontend components
6. 🔜 Integrate with existing UI
7. 🔜 Deploy to production

---

## Useful Commands

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Start backend
cd backend && npm run dev

# Test models
cd backend && node test-new-features.js

# Check MongoDB
mongosh
use unied
show collections

# View logs
tail -f backend.log

# Kill port 5001
lsof -ti:5001 | xargs kill -9
```

---

## API Documentation

For complete API documentation, see:
- `NEW_FEATURES_DOCUMENTATION.md` - Detailed API docs
- `FEATURE_IMPLEMENTATION_SUMMARY.md` - Implementation summary

---

## Support

If you encounter any issues:
1. Check server logs for errors
2. Verify MongoDB is running
3. Ensure you have a valid access token
4. Check that you have the correct role (student/faculty)
5. Review the API documentation

---

**🎉 You're all set! Start testing the new features!**
