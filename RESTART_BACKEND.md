# Backend Server Restart Required

## Issue
The new review submission routes were added but the backend server needs to be restarted to load them.

## Error
- 404 Not Found for `/api/v1/instructor/assignments/:assignmentId/review/:studentId`
- This happens because the server is still running the old code without the new routes

## Solution

### Option 1: Restart Backend Server
1. Stop the current backend server (Ctrl+C in the terminal running it)
2. Start it again:
   ```bash
   cd backend
   npm start
   ```

### Option 2: Use nodemon (auto-restart on file changes)
If you want automatic restarts when files change:
1. Install nodemon globally:
   ```bash
   npm install -g nodemon
   ```
2. Run backend with nodemon:
   ```bash
   cd backend
   nodemon server.js
   ```

## What Was Added
- New route: `POST /api/v1/instructor/assignments/:assignmentId/review/:studentId`
- New controller method: `reviewSubmission`
- New service method: `reviewSubmission` in instructorService.js
- Real-time Socket.IO notifications for submission reviews

## After Restart
All these features will work:
- ✅ Mark submission as viewed
- ✅ Approve submission
- ✅ Disapprove submission (with feedback)
- ✅ Grade submission
- ✅ Real-time notifications to students
