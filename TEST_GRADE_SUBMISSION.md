# Testing Grade Submission Issue

## Current Problem
Getting 422 Validation Error when trying to grade submissions.

## Steps to Debug:

### 1. **RESTART BACKEND SERVER** (CRITICAL!)
```bash
# Stop current backend (Ctrl+C in backend terminal)
# Then start again:
cd backend
npm start
```

### 2. Check Backend Console
When you try to grade, you should see these logs:
```
=== GRADE SUBMISSION REQUEST ===
Assignment ID: ...
Student ID: ...
Grade: ...
```

If you DON'T see these logs, the server wasn't restarted!

### 3. Test the Grade Endpoint Manually
```bash
# Replace with your actual IDs and token
curl -X POST http://localhost:5001/api/v1/instructor/assignments/YOUR_ASSIGNMENT_ID/grade/YOUR_STUDENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"grade": 85, "feedback": "Good work"}'
```

### 4. Common Issues:

**Issue**: Backend not restarted
**Solution**: Stop backend (Ctrl+C) and run `npm start` again

**Issue**: Old code still running
**Solution**: Kill all node processes and restart
```bash
pkill -f "node server.js"
cd backend
npm start
```

**Issue**: Validation error from Mongoose
**Solution**: Check backend console for exact error message

### 5. What the Backend Should Log:

```
=== GRADE SUBMISSION REQUEST ===
Assignment ID: 6946687270b08212e8bd52c8
Student ID: 693c72f897d3024476b143c4
Instructor ID: ...
Grade: 85
Feedback: Good work
Request body: { grade: 85, feedback: 'Good work' }

=== GRADE SUBMISSION SERVICE ===
Assignment ID: 6946687270b08212e8bd52c8
Student ID: 693c72f897d3024476b143c4
Grade Data: { grade: 85, feedback: 'Good work' }
Found submission: Yes
Current submission status: submitted
Grade value (converted): 85
Total marks: 100
Updated submission: { grade: 85, feedback: 'Good work', status: 'graded' }
✅ Assignment saved successfully
```

### 6. If Still Not Working:

Share the EXACT output from your backend console when you try to grade.
