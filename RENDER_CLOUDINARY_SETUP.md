# 🚀 Setup Cloudinary on Render

## Issue
Profile picture and file uploads are failing with 500 error because Cloudinary credentials are missing on Render.

## ✅ Solution: Add Cloudinary Environment Variables

### Step 1: Get Your Cloudinary Credentials

1. Go to https://cloudinary.com/console
2. Login to your account
3. On the dashboard, you'll see:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: Click "Show" to reveal (e.g., `abcdefghijklmnopqrstuvwxyz`)

### Step 2: Add to Render

1. Go to https://dashboard.render.com/
2. Click on your **unied-backend** service
3. Click **Environment** tab on the left
4. Add these three environment variables:

   **Variable 1:**
   - Key: `CLOUDINARY_CLOUD_NAME`
   - Value: `your-cloud-name` (from Cloudinary dashboard)

   **Variable 2:**
   - Key: `CLOUDINARY_API_KEY`
   - Value: `your-api-key` (from Cloudinary dashboard)

   **Variable 3:**
   - Key: `CLOUDINARY_API_SECRET`
   - Value: `your-api-secret` (from Cloudinary dashboard)

5. Click **Save Changes**
6. Render will automatically redeploy (takes 2-5 minutes)

### Step 3: Test

After deployment completes:
1. Go to your app: https://uniedplatform.vercel.app
2. Try uploading a profile picture
3. Try uploading a file in messages
4. Should work! ✅

## 🔍 How to Check if It's Working

### Check Render Logs:
1. Go to Render dashboard
2. Click your service
3. Click **Logs** tab
4. Look for: `✅ Cloudinary configured`
5. If you see errors about Cloudinary credentials, double-check the values

### Check Upload:
1. Try uploading a profile picture
2. If successful, you'll see the image immediately
3. If it fails, check Render logs for the error message

## 📋 Quick Checklist

- [ ] Got Cloudinary credentials from https://cloudinary.com/console
- [ ] Added `CLOUDINARY_CLOUD_NAME` to Render
- [ ] Added `CLOUDINARY_API_KEY` to Render
- [ ] Added `CLOUDINARY_API_SECRET` to Render
- [ ] Clicked "Save Changes" on Render
- [ ] Waited for deployment to complete (2-5 min)
- [ ] Tested profile picture upload
- [ ] Tested file upload in messages

## ⚠️ Common Issues

### Issue: Still getting 500 error
**Solution:** 
- Check Render logs for specific error
- Make sure all 3 Cloudinary variables are set
- Make sure there are no typos in the values
- Try redeploying manually

### Issue: "Cloudinary credentials not configured"
**Solution:**
- You forgot to add one or more environment variables
- Go back to Render Environment tab and add them

### Issue: "Invalid credentials"
**Solution:**
- Double-check you copied the correct values from Cloudinary
- Make sure you revealed the API Secret before copying
- No extra spaces in the values

## 🎯 Expected Result

After setup:
- ✅ Profile picture uploads work
- ✅ File uploads in messages work
- ✅ Course image uploads work
- ✅ Assignment file uploads work
- ✅ All files stored on Cloudinary (not on Render's filesystem)

---

**Need help?** Check the Render logs for specific error messages.
