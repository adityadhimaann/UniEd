# Fix: CONFIGURATION_NOT_FOUND Error

## Your Current Error

```
GET https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyAEOjjrEbLG7ltv7SEuaF6sTcC3utx3i3E 400 (Bad Request)
{"error":{"code":400,"message":"CONFIGURATION_NOT_FOUND"}}
```

## What This Means

Your Firebase project exists (`unied-911e3`), but the **Web app is not properly registered** in Firebase Console.

## Quick Fix (5 minutes)

### Step 1: Go to Firebase Console
Open: https://console.firebase.google.com/project/unied-911e3/settings/general

### Step 2: Check "Your apps" Section
Scroll down to the "Your apps" section at the bottom of the page.

**Do you see a Web app listed?**

#### If NO Web app exists:
1. Click **"Add app"** button
2. Click the **Web icon** (`</>`)
3. Enter nickname: `UniEd Frontend`
4. **Do NOT** check "Also set up Firebase Hosting"
5. Click **"Register app"**
6. **Copy the entire config object** that appears
7. Click **"Continue to console"**

#### If a Web app already exists:
1. Click on the Web app name
2. Scroll to "SDK setup and configuration"
3. Select **"Config"** radio button
4. **Copy the entire config object**

### Step 3: Update .env.local

Replace the values in `frontend/.env.local` with the NEW config:

```env
# AI Assessment Backend URL
VITE_AI_ASSESSMENT_API_URL=https://lisa-ai-backend.onrender.com/api

# Firebase Configuration (UPDATE THESE)
VITE_FIREBASE_API_KEY=your_new_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=unied-911e3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=unied-911e3
VITE_FIREBASE_STORAGE_BUCKET=unied-911e3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 4: Enable Firestore (If Not Already)

1. In Firebase Console, click **"Firestore Database"** in left menu
2. If you see "Create database" button:
   - Click it
   - Select **"Start in test mode"**
   - Choose region (e.g., `us-central1`)
   - Click **"Enable"**
3. If database already exists, you're good!

### Step 5: Set Firestore Rules (For Testing)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

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

3. Click **"Publish"**

⚠️ **Note**: These are permissive rules for testing only!

### Step 6: Restart Dev Server

**IMPORTANT**: You MUST restart for .env changes to take effect!

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 7: Verify Configuration

1. Navigate to: `http://localhost:5173/dashboard/ai-assessment/config`
2. Check that all items show green checkmarks ✓
3. Open browser console (F12)
4. Look for: `✅ Firebase initialized successfully`

### Step 8: Run Tests

1. Navigate to: `http://localhost:5173/dashboard/ai-assessment/test`
2. Click **"Run All Tests"**
3. All 7 tests should pass with green checkmarks ✓

## Alternative: Create New Firebase Project

If the above doesn't work, create a fresh project:

### 1. Create New Project
1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Name: `unied-lisa-ai-new`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Add Web App
1. Click Web icon (`</>`)
2. Nickname: `UniEd Frontend`
3. Register app
4. Copy config

### 3. Enable Firestore
1. Click **"Firestore Database"**
2. Create database in test mode
3. Choose region
4. Enable

### 4. Update .env.local
Use the new project's config values

### 5. Restart & Test
Follow steps 6-8 above

## Verification Checklist

- [ ] Web app registered in Firebase Console
- [ ] Firestore Database enabled
- [ ] Firestore rules set to test mode
- [ ] .env.local updated with correct values
- [ ] Dev server restarted
- [ ] Browser console shows "Firebase initialized successfully"
- [ ] Config check page shows all green checkmarks
- [ ] All tests pass

## Still Having Issues?

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for Firebase-related errors
4. Share the error message

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "firebase" or "googleapis"
4. Check if requests are failing
5. Click failed request to see details

### Verify Project Exists
1. Go to: https://console.firebase.google.com/
2. Make sure `unied-911e3` project is listed
3. Click on it to open
4. Check if it's active (not deleted)

## Common Mistakes

❌ **Forgot to restart dev server** after changing .env.local  
✅ Always restart after env changes

❌ **Using old/cached API key**  
✅ Get fresh config from Firebase Console

❌ **Web app not registered**  
✅ Must register Web app in Firebase Console

❌ **Firestore not enabled**  
✅ Enable Firestore Database in Firebase Console

❌ **Wrong project selected**  
✅ Make sure you're in the correct Firebase project

## Success Indicators

When everything is working:
- ✅ No errors in browser console
- ✅ Message: "Firebase initialized successfully"
- ✅ Config check shows all green
- ✅ All tests pass
- ✅ Data appears in Firestore Console

## Need More Help?

1. Check `FIREBASE_SETUP.md` for detailed setup
2. Check `FIREBASE_TEST_GUIDE.md` for testing
3. Visit: https://firebase.google.com/docs/web/setup
