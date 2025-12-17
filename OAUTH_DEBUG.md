# OAuth Configuration Debugging Guide

## Issue
Getting error: `{"success":false,"statusCode":500,"message":"Unknown authentication strategy \"google\"\""}`

## Root Cause
The Google OAuth strategy is not being registered with Passport.js, most likely because the environment variables are missing or not properly set on Render.

## Solution Steps

### 1. Check Render Environment Variables
Go to your Render dashboard → Your backend service → Environment tab and verify these variables are set:

**Required for Google OAuth:**
- `GOOGLE_CLIENT_ID` - Should be a long string ending in `.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET` - Should be a secret key from Google Cloud Console
- `BACKEND_URL` - Should be `https://unied-backend.onrender.com`
- `FRONTEND_URL` - Should be your frontend URL

**Required for Microsoft OAuth:**
- `MICROSOFT_CLIENT_ID` - Azure AD application client ID
- `MICROSOFT_CLIENT_SECRET` - Azure AD application client secret

### 2. Verify Google Cloud Console Setup
1. Go to https://console.cloud.google.com
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Find your OAuth 2.0 Client ID
5. Click Edit
6. Under "Authorized redirect URIs", ensure you have:
   - `https://unied-backend.onrender.com/api/v1/oauth/google/callback`
7. Copy the Client ID and Client Secret to Render environment variables

### 3. Check Logs on Render
After deploying, check your Render logs for these messages:
- ✅ `Google OAuth Strategy configured successfully` - GOOD!
- ⚠️ `Google OAuth Strategy NOT configured - missing...` - BAD! Environment variables are missing

### 4. Redeploy
After setting the environment variables:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Wait for deployment to complete
4. Check logs for the success message

### 5. Test
Try accessing: `https://unied-backend.onrender.com/api/v1/oauth/google`
- Should redirect to Google login page
- Should NOT show the "Unknown authentication strategy" error

## Debug Checklist
- [ ] Environment variables set on Render
- [ ] Google Cloud Console redirect URIs updated
- [ ] Backend redeployed
- [ ] Logs show "✅ Google OAuth Strategy configured successfully"
- [ ] Test URL redirects to Google
- [ ] Callback works and redirects to frontend

## Common Issues

### Issue: Variables set but still not working
**Solution:** Render requires a redeploy after changing environment variables. Click "Manual Deploy".

### Issue: Redirect URI mismatch
**Solution:** Ensure the callback URL in Google Cloud Console EXACTLY matches:
```
https://unied-backend.onrender.com/api/v1/oauth/google/callback
```

### Issue: Still getting errors after fixing
**Solution:** Clear build cache when deploying:
1. Render Dashboard → Your Service
2. Manual Deploy → Check "Clear build cache & deploy"
