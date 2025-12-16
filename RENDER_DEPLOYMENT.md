# Render Backend Deployment Guide

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- MongoDB Atlas account for production database

## Step 1: Prepare MongoDB Atlas (Production Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 Sandbox - Free forever)
3. Create a database user with username and password
4. Whitelist all IPs: `0.0.0.0/0` (for Render access)
5. Get your connection string (it should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/unied?retryWrites=true&w=majority
   ```

## Step 2: Push Backend to GitHub

```bash
cd /Users/aditya/UniEd
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 3: Deploy on Render

### Option A: Using Render Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `UniEd` repository
5. Configure the service:
   - **Name**: `unied-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_REFRESH_SECRET=<generate-another-secure-random-string>
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CORS_ORIGIN=https://frontend-kp21tww2h-adityadhimaanns-projects.vercel.app
   FRONTEND_URL=https://frontend-kp21tww2h-adityadhimaanns-projects.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=5242880
   ```

   **Optional (if using Redis/Cloudinary/Email):**
   ```
   REDIS_URL=<your-redis-url-from-upstash-or-redis-cloud>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail>
   EMAIL_PASSWORD=<your-gmail-app-password>
   EMAIL_FROM=noreply@unied.com
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```

7. Click "Create Web Service"
8. Wait for deployment (usually 2-5 minutes)
9. Your backend URL will be: `https://unied-backend.onrender.com`

### Option B: Using render.yaml Blueprint

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the `UniEd` repository
5. Render will detect the `render.yaml` file
6. Fill in the environment variables marked as `sync: false`
7. Click "Apply"

## Step 4: Update Frontend Environment Variables

After deployment, update your Vercel frontend environment variables:

```bash
cd /Users/aditya/UniEd/frontend
```

Create/update `.env.production`:
```
VITE_API_URL=https://unied-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://unied-backend.onrender.com
```

Then redeploy to Vercel:
```bash
vercel --prod
```

## Step 5: Test Your Deployment

1. Check if backend is running: `https://unied-backend.onrender.com/health`
2. Test login from your frontend
3. Check Render logs for any errors

## Important Notes

### Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- 750 hours/month of runtime

### Generate Secure Secrets
Use this command to generate secure random strings for JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Redis Cloud (Optional - Free Tier)
If you need Redis:
1. Go to https://redis.com/try-free/
2. Create a free database
3. Get the connection URL
4. Add to Render environment variables

### Cloudinary (Optional - Free Tier)
If you need file uploads:
1. Go to https://cloudinary.com
2. Sign up for free account
3. Get your cloud name, API key, and API secret
4. Add to Render environment variables

## Monitoring

- View logs: Render Dashboard → Your Service → Logs
- Monitor metrics: Render Dashboard → Your Service → Metrics
- Set up alerts: Render Dashboard → Your Service → Settings → Notifications

## Troubleshooting

### Build Fails
- Check if `package.json` is in the backend directory
- Verify all dependencies are listed in `package.json`
- Check Render build logs

### Database Connection Fails
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes `0.0.0.0/0`
- Ensure database user has correct permissions

### CORS Errors
- Update `CORS_ORIGIN` to match your Vercel frontend URL
- Update `FRONTEND_URL` environment variable

### Cold Starts
- Free tier spins down after inactivity
- Consider upgrading to paid tier for always-on service
- Or use a service like UptimeRobot to ping your API every 5 minutes
