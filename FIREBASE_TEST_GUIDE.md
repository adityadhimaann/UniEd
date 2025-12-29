# Firebase Testing Guide

## Quick Test Instructions

### 1. Access the Test Page
Navigate to: `http://localhost:5173/dashboard/ai-assessment/test`

### 2. Run the Tests
1. Make sure you're logged in
2. Click "Run All Tests" button
3. Watch the toast notifications for each test
4. Check the results displayed on the page

### 3. What Gets Tested

The test suite will verify:

✅ **Save Assessment Session** - Creates a new session in Firestore  
✅ **Update Session** - Updates session progress  
✅ **Get Session** - Retrieves session data  
✅ **Complete Session** - Marks session as completed  
✅ **Update User Stats** - Updates user statistics  
✅ **Get User Stats** - Retrieves user statistics  
✅ **Add to Leaderboard** - Adds entry to leaderboard  
✅ **Get Leaderboard** - Retrieves leaderboard data  

### 4. Expected Results

All tests should show green checkmarks (✓) if Firebase is configured correctly.

### 5. Verify in Firebase Console

After running tests, check your Firebase Console:

1. **Firestore Database**
   - Collection: `assessmentSessions` - Should have 1 document
   - Collection: `userStats` - Should have 1 document with your user ID
   - Collection: `leaderboard` - Should have 1 entry

2. **Check Data Structure**
   - Open each collection
   - Verify the data matches the expected structure
   - Check timestamps are populated

### 6. Common Issues & Solutions

#### Issue: "Permission denied"
**Solution**: Check Firestore security rules. For testing, you can temporarily use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ONLY FOR TESTING!
    }
  }
}
```

#### Issue: "Firebase not initialized"
**Solution**: Verify `.env.local` has all Firebase config variables

#### Issue: "User not found"
**Solution**: Make sure you're logged into the application

### 7. Manual Testing Checklist

After automated tests pass, manually test:

- [ ] Complete a full assessment
- [ ] Check if session is saved in Firebase
- [ ] Refresh page and verify data persists
- [ ] Check leaderboard shows your score
- [ ] Verify user stats are updated
- [ ] Test on different devices (cross-device sync)

### 8. Production Security Rules

Before deploying, update Firestore rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assessment Sessions
    match /assessmentSessions/{sessionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // User Stats
    match /userStats/{userId} {
      allow read: if request.auth != null && userId == request.auth.uid;
      allow write: if request.auth != null && userId == request.auth.uid;
    }
    
    // Leaderboard
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 9. Next Steps

Once tests pass:
1. Integrate Firebase into actual assessment flow
2. Add history and leaderboard components to UI
3. Test with multiple users
4. Monitor Firebase usage in console
5. Set up billing alerts

### 10. Troubleshooting Commands

```bash
# Check if Firebase is installed
npm list firebase

# Reinstall if needed
npm install firebase

# Check environment variables
cat frontend/.env.local | grep FIREBASE

# View browser console for errors
# Open DevTools > Console
```

## Support

If tests fail, check:
1. Firebase Console > Project Settings > Config is correct
2. `.env.local` has all variables
3. Firestore Database is created and enabled
4. Browser console for detailed error messages
5. Network tab to see if requests are being made

## Success Indicators

✅ All 7 tests show green checkmarks  
✅ Toast notifications show success messages  
✅ Firebase Console shows new documents  
✅ No errors in browser console  
✅ Data persists after page refresh  
