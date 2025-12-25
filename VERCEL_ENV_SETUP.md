# 🚀 Setup Vercel Environment Variables

## Issue
Frontend on Vercel is calling `localhost:5001` instead of production backend URL.

## ✅ Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your **uniedplatform** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Environment Variables

Add these two variables for **Production** environment:

**Variable 1:**
- Key: `VITE_API_BASE_URL`
- Value: `https://unied-backend.onrender.com/api/v1`
- Environment: **Production** (check the box)

**Variable 2:**
- Key: `VITE_SOCKET_URL`
- Value: `https://unied-backend.onrender.com`
- Environment: **Production** (check the box)

### Step 3: Redeploy

After adding the variables:

**Option A: Automatic (if auto-deploy is enabled)**
- Just wait 2-3 minutes for Vercel to auto-deploy from GitHub

**Option B: Manual**
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

### Step 4: Test

After deployment:
1. Go to https://uniedplatform.vercel.app
2. Try sending a message
3. Try uploading a file
4. Should work! ✅

## 🔍 How to Verify

### Check if Variables are Set:
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. You should see both variables listed

### Check if Deployment Used Variables:
1. Go to Deployments tab
2. Click on the latest deployment
3. Click **View Build Logs**
4. Look for environment variables being loaded

## 📋 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Selected uniedplatform project
- [ ] Went to Settings → Environment Variables
- [ ] Added `VITE_API_BASE_URL` = `https://unied-backend.onrender.com/api/v1`
- [ ] Added `VITE_SOCKET_URL` = `https://unied-backend.onrender.com`
- [ ] Selected **Production** environment for both
- [ ] Clicked **Save**
- [ ] Redeployed (or waited for auto-deploy)
- [ ] Tested the app

## ⚠️ Important Notes

### Why .env.production doesn't work:
- Vercel doesn't automatically read `.env.production` files
- You MUST set environment variables in the Vercel Dashboard
- This is a security feature

### Environment Scopes:
- **Production**: Used for your main domain (uniedplatform.vercel.app)
- **Preview**: Used for preview deployments (PR branches)
- **Development**: Used for local development

Make sure to select **Production** when adding variables!

## 🎯 Expected Result

After setup:
- ✅ Messages send to production backend
- ✅ File uploads work
- ✅ No more localhost CORS errors
- ✅ All API calls go to https://unied-backend.onrender.com

---

**Still having issues?** 
- Make sure you redeployed after adding variables
- Check build logs for any errors
- Clear browser cache and try again
