# OAuth Redirect Fix - Remove Render Loading Screen

## Problem
When users sign up with Google OAuth, they see the Render "SERVICE WAKING UP" screen instead of being redirected to the frontend.

## Root Cause
The `FRONTEND_URL` environment variable on Render is set to `localhost:8080` instead of your production frontend URL.

## Solution

### Step 1: Update Render Environment Variables

1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your `unied-backend` service
3. Go to "Environment" tab
4. Find or add these environment variables:

```
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
BACKEND_URL=https://unied-backend.onrender.com
```

**Important:** Replace `your-frontend-url.vercel.app` with your actual Vercel frontend URL.

### Step 2: Update Google OAuth Redirect URI

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to "APIs & Services" > "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", make sure you have:
   ```
   https://unied-backend.onrender.com/api/v1/oauth/google/callback
   ```
5. Save the changes

### Step 3: Redeploy Backend (if needed)

After updating the environment variables, Render should automatically redeploy. If not:
1. Go to your service in Render
2. Click "Manual Deploy" > "Deploy latest commit"

## How to Find Your Frontend URL

If you deployed your frontend to Vercel:
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Look for the "Domains" section
4. Copy the production URL (usually ends with `.vercel.app`)

## Testing

After making these changes:
1. Clear your browser cache and cookies
2. Try signing up with Google again
3. You should be redirected to your frontend instead of seeing the Render screen

## Additional Notes

- The Render "SERVICE WAKING UP" screen appears because Render's free tier puts services to sleep after inactivity
- Once the environment variables are correctly set, users will be redirected to the frontend while the backend wakes up in the background
