# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `unied-lisa-ai` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional, can enable later)
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue**

## Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter app nickname: `UniEd Frontend`
3. **Do NOT** check "Also set up Firebase Hosting"
4. Click **Register app**
5. You'll see a configuration object - **KEEP THIS PAGE OPEN**

## Step 3: Copy Firebase Configuration

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 4: Add to .env.local

1. Open `frontend/.env.local`
2. Add these lines (replace with YOUR values):

```env
# AI Assessment Backend URL
VITE_AI_ASSESSMENT_API_URL=https://lisa-ai-backend.onrender.com/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Save the file
4. **IMPORTANT**: Restart your dev server for changes to take effect

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Click **Next**
5. Choose your Cloud Firestore location (closest to your users)
   - Recommended: `us-central1` (Iowa) for US
   - Or choose your region
6. Click **Enable**
7. Wait for database creation (takes ~1 minute)

## Step 6: Set Up Security Rules (For Testing)

1. In Firestore Database, click the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

⚠️ **WARNING**: These rules allow anyone to read/write. Only use for testing!

## Step 7: Verify Setup

1. Restart your dev server if you haven't already
2. Open browser console (F12)
3. Look for: `✅ Firebase initialized successfully`
4. If you see warnings, check your `.env.local` file

## Step 8: Test Firebase Integration

1. Navigate to: `http://localhost:5173/dashboard/ai-assessment/test`
2. Click **"Run All Tests"**
3. All tests should pass with green checkmarks ✓

## Step 9: Verify in Firebase Console

1. Go to Firestore Database in Firebase Console
2. You should see 3 collections:
   - `assessmentSessions`
   - `userStats`
   - `leaderboard`
3. Click each to verify data was created

## Step 10: Secure Your Database (Production)

Before deploying to production, update Firestore rules:

1. Go to Firestore Database > Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assessment Sessions - users can only access their own
    match /assessmentSessions/{sessionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // User Stats - users can only access their own
    match /userStats/{userId} {
      allow read: if request.auth != null && userId == request.auth.uid;
      allow write: if request.auth != null && userId == request.auth.uid;
    }
    
    // Leaderboard - everyone can read, authenticated users can write
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
**Solution**: 
- Check that `VITE_FIREBASE_API_KEY` in `.env.local` matches your Firebase config
- Make sure there are no extra spaces or quotes
- Restart dev server after changing `.env.local`

### Error: "Firebase is not configured"
**Solution**:
- Verify all `VITE_FIREBASE_*` variables are in `.env.local`
- Check for typos in variable names
- Restart dev server

### Error: "Missing or insufficient permissions"
**Solution**:
- Check Firestore security rules
- For testing, use the permissive rules from Step 6
- Make sure Firestore Database is enabled

### Tests fail but no error message
**Solution**:
- Open browser console (F12) for detailed errors
- Check Network tab to see if requests are being made
- Verify you're logged into the application

### Can't see data in Firebase Console
**Solution**:
- Refresh the Firestore Database page
- Check you're looking at the correct project
- Verify tests actually ran (check toast notifications)

## Environment Variables Checklist

Make sure your `frontend/.env.local` has:

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` (optional)

## Next Steps

Once setup is complete:
1. ✅ Run tests at `/dashboard/ai-assessment/test`
2. ✅ Verify data in Firebase Console
3. ✅ Complete a real assessment
4. ✅ Check leaderboard and history features
5. ✅ Update security rules for production

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
