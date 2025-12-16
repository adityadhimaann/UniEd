# UniEd Frontend-Backend Integration Test Plan

## Test Checklist

### 1. Backend Server
- [ ] MongoDB running on localhost:27017
- [ ] Backend server running on localhost:5001
- [ ] Health endpoint accessible: http://localhost:5001/health

### 2. Frontend Server
- [ ] Frontend running on localhost:8080
- [ ] Environment variables loaded (.env file)

### 3. Test Registration Flow (Student)
- [ ] Navigate to /signup
- [ ] Fill in: firstName, lastName, email, password
- [ ] Select role: Student
- [ ] Fill in department (e.g., "Computer Science")
- [ ] Fill in student ID (e.g., "STU001")
- [ ] Fill in semester (e.g., 1)
- [ ] Click Create Account
- [ ] Verify user is redirected to /dashboard
- [ ] Verify tokens stored in localStorage

### 4. Test Login Flow
- [ ] Navigate to /login
- [ ] Enter registered email and password
- [ ] Click Sign In
- [ ] Verify redirect to /dashboard
- [ ] Verify user data loaded

### 5. Test Logout Flow
- [ ] Click logout button
- [ ] Verify redirect to landing page
- [ ] Verify tokens cleared from localStorage

### 6. Test Token Refresh
- [ ] Login successfully
- [ ] Wait for token to expire
- [ ] Make an API call
- [ ] Verify token refreshes automatically

### 7. Socket.IO Connection
- [ ] Verify socket connects on login
- [ ] Check browser console for "Socket connected" message
- [ ] Verify socket disconnects on logout

## Testing Commands

### Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod --dbpath=/path/to/data/db
```

### Start Backend
```bash
cd /Users/aditya/UniEd/backend
npm run dev
```

### Start Frontend
```bash
cd /Users/aditya/UniEd/frontend
npm run dev
```

## Test User Credentials

### Student
- Email: student@unied.com
- Password: password123
- Role: student

### Faculty
- Email: faculty@unied.com
- Password: password123
- Role: faculty

### Admin
- Email: admin@unied.com
- Password: password123
- Role: admin

## Expected API Responses

### Successful Registration
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "...",
      "role": "...",
      "firstName": "...",
      "lastName": "..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "...",
      "role": "..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Troubleshooting

### CORS Errors
- Check backend .env: CORS_ORIGIN=http://localhost:8080
- Check backend src/app.js has correct origin

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env

### Socket.IO Not Connecting
- Check token is being sent in socket auth
- Check backend socket handler for errors

### Token Refresh Not Working
- Check JWT_REFRESH_SECRET matches in backend
- Check refreshToken is stored in localStorage
