# 🚀 Quick Start Guide

## Start Everything in 3 Steps

### Step 1: Ensure MongoDB is Running
```bash
# Check if MongoDB is running
pgrep -x mongod

# If not running, start it
brew services start mongodb-community
```

### Step 2: Start Backend
```bash
# Open a terminal
cd /Users/aditya/UniEd/backend

# Kill any process on port 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Start the backend
npm run dev
```

**Wait for:**
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5001
```

### Step 3: Start Frontend
```bash
# Open another terminal
cd /Users/aditya/UniEd/frontend

# Start the frontend
npm run dev
```

**Visit:** http://localhost:8081

## Test in 1 Minute

1. Go to http://localhost:8081/signup
2. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@unied.com
   - Password: Test123!
3. Click Continue
4. Select: Student
5. Click Continue
6. Fill: Computer Science, STU001, Semester 1
7. Click Create Account

**You should be logged in and redirected to dashboard!** ✅

## Files to Check

### Frontend
- [x] `src/lib/api.ts` - API client
- [x] `src/services/authService.ts` - Auth service
- [x] `src/contexts/AuthContext.tsx` - Auth context
- [x] `src/lib/socket.ts` - Socket client
- [x] `.env` - Environment variables

### Backend  
- [x] `.env` - CORS_ORIGIN=http://localhost:8081
- [x] `src/app.js` - CORS configured

## Verify Integration

Open browser DevTools (F12):

**Console should show:**
```
✅ Socket connected: <socket-id>
```

**Network tab should show:**
```
POST http://localhost:5001/api/v1/auth/register → 201 Created
```

**localStorage should have:**
```
edu_user: {id, email, role, ...}
accessToken: eyJhbGci...
refreshToken: eyJhbGci...
```

---

**That's it! Everything is connected and working! 🎉**

For detailed information, see:
- `INTEGRATION_COMPLETE.md` - Full guide
- `CHANGES.md` - What was changed
- `INTEGRATION_TEST_PLAN.md` - Test plan
