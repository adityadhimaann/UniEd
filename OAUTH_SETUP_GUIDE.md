# OAuth Authentication Setup Guide (Google & Microsoft)

## Complete Setup - Step by Step

This guide will walk you through setting up Google and Microsoft OAuth authentication for UniEd.

---

## Part 1: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"NEW PROJECT"**
3. Project name: `UniEd` (or any name)
4. Click **"CREATE"**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and press **"ENABLE"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: `UniEd`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `UniEd Web App`
   
5. **Authorized JavaScript origins:**
   ```
   http://localhost:5001
   https://unied-backend.onrender.com
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:5001/api/v1/auth/google/callback
   https://unied-backend.onrender.com/api/v1/auth/google/callback
   ```

7. Click **"CREATE"**

8. **IMPORTANT:** Copy the **Client ID** and **Client Secret**
   - Save them somewhere safe!

---

## Part 2: Microsoft OAuth Setup

### Step 1: Create Azure Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Sign in or create a free account

### Step 2: Register Application

1. In Azure Portal, search for **"Azure Active Directory"** or **"Microsoft Entra ID"**
2. Click **"App registrations"** in the left sidebar
3. Click **"+ New registration"**

4. Fill in the details:
   - Name: `UniEd`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: 
     - Platform: **Web**
     - URL: `http://localhost:5001/api/v1/auth/microsoft/callback`
   - Click **"Register"**

### Step 3: Get Client ID and Create Secret

1. After registration, you'll see the **Application (client) ID** - **Copy this!**

2. In the left sidebar, click **"Certificates & secrets"**
3. Click **"+ New client secret"**
   - Description: `UniEd Production`
   - Expires: **24 months** (or your preference)
   - Click **"Add"**

4. **IMPORTANT:** Copy the **Value** immediately (it won't be shown again!)

### Step 4: Add Production Redirect URI

1. Go to **Authentication** in the left sidebar
2. Under **Platform configurations** → **Web** → **Redirect URIs**, click **"Add URI"**
3. Add:
   ```
   https://unied-backend.onrender.com/api/v1/auth/microsoft/callback
   ```
4. Click **"Save"** at the bottom

### Step 5: Configure API Permissions (Optional but Recommended)

1. Go to **API permissions** in the left sidebar
2. Click **"+ Add a permission"**
3. Select **"Microsoft Graph"**
4. Select **"Delegated permissions"**
5. Add:
   - `User.Read`
   - `profile`
   - `email`
6. Click **"Add permissions"**

---

## Part 3: Update Environment Variables

### Backend (.env)

Add these variables to `/Users/aditya/UniEd/backend/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# Backend URL (update for production)
BACKEND_URL=http://localhost:5001

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### Render Environment Variables (Production)

Go to your Render dashboard → Environment tab and add:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
BACKEND_URL=https://unied-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Part 4: Testing

### Local Testing

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Go to `http://localhost:5173/login`

4. Click **"Google"** or **"Microsoft"** button

5. You should be redirected to the OAuth provider

6. After authentication, you should be redirected back to the dashboard

### Production Testing

1. Make sure all environment variables are set on Render and Vercel

2. Go to your production frontend URL

3. Test Google and Microsoft login

---

## Part 5: Troubleshooting

### Common Issues

**1. "redirect_uri_mismatch" error**
- Solution: Make sure your redirect URIs in Google/Microsoft console EXACTLY match your backend URL
- Format: `https://unied-backend.onrender.com/api/v1/auth/google/callback` (no trailing slash)

**2. "Unauthorized" error**
- Solution: Check if environment variables are correctly set
- Verify Client ID and Secret are correct

**3. User is redirected but not logged in**
- Solution: Check browser console for errors
- Verify the AuthCallback component is receiving the token
- Check if FRONTEND_URL in backend .env matches your actual frontend URL

**4. CORS errors**
- Solution: Make sure CORS_ORIGIN in backend .env includes your frontend URL

**5. "Cannot GET /api/v1/auth/google"**
- Solution: Backend server needs to be restarted after adding OAuth routes

---

## Part 6: Security Best Practices

1. **Never commit secrets to Git:**
   - Add `.env` to `.gitignore`
   - Use environment variables for all sensitive data

2. **Use HTTPS in production:**
   - OAuth providers require HTTPS for redirect URIs in production
   - Render provides HTTPS automatically

3. **Limit OAuth scopes:**
   - Only request the minimum permissions needed
   - For our app: `profile` and `email` are sufficient

4. **Rotate secrets periodically:**
   - Change Client Secrets every 3-6 months
   - Microsoft allows multiple active secrets for zero-downtime rotation

5. **Monitor OAuth usage:**
   - Check Google Cloud Console and Azure Portal for unusual activity

---

## Part 7: How It Works

### Flow Diagram:

```
User clicks "Sign in with Google"
        ↓
Frontend redirects to: http://localhost:5001/api/v1/auth/google
        ↓
Backend redirects to Google OAuth page
        ↓
User grants permissions
        ↓
Google redirects to: http://localhost:5001/api/v1/auth/google/callback?code=...
        ↓
Backend exchanges code for user info
        ↓
Backend creates/updates user in database
        ↓
Backend generates JWT token
        ↓
Backend redirects to: http://localhost:5173/auth/callback?token=...
        ↓
Frontend stores token and redirects to dashboard
```

### Database Schema:

The User model now includes:
- `googleId`: Unique Google user ID
- `microsoftId`: Unique Microsoft user ID  
- `authProvider`: 'local' | 'google' | 'microsoft'
- `password`: Optional (not required for OAuth users)

---

## Part 8: Next Steps

### Add OAuth to Signup Page

The same OAuth buttons can be added to the Signup page using the same approach as Login.

### Add Profile Picture from OAuth

The OAuth providers return profile pictures. You can store them in the `avatar` field.

### Role Selection for OAuth Users

Currently, OAuth users are created with role 'student' by default. You can add a role selection page after OAuth authentication.

---

## Files Modified

### Backend:
- `backend/src/config/passport.js` (NEW) - Passport strategies
- `backend/src/routes/oauthRoutes.js` (NEW) - OAuth routes
- `backend/src/models/User.js` - Added OAuth fields
- `backend/src/routes/index.js` - Added OAuth routes
- `backend/src/app.js` - Added Passport middleware
- `backend/package.json` - Added passport packages

### Frontend:
- `frontend/src/pages/AuthCallback.tsx` (NEW) - OAuth callback handler
- `frontend/src/pages/Login.tsx` - Added OAuth buttons
- `frontend/src/App.tsx` - Added callback route

---

## Support

If you encounter issues:
1. Check the Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure redirect URIs match exactly

---

**Setup Complete! 🎉**

Your users can now sign in with Google or Microsoft!
