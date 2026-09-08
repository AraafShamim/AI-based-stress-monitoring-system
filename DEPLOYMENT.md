# Deployment Guide - MannSetu Stress Monitoring System

## Overview
This guide walks you through deploying the MannSetu application with:
- **Frontend:** Vercel (static hosting)
- **Backend:** Render.com (Spring Boot API)
- **Database:** Render PostgreSQL (or any managed PostgreSQL)
- **AI Service:** (Optional) Deploy separately or use local for development

---

## Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Render.com account (free tier is fine)
- Your code pushed to a GitHub repository

---

## Part 1: Deploy Backend to Render.com

### Step 1: Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name:** `mannsetu-db`
   - **Database:** `sih26094_db`
   - **User:** (auto-generated)
   - **Region:** Choose closest to your users
   - **Plan:** Free
4. Click **Create Database**
5. **Save the connection details** (Internal Database URL)

### Step 2: Run Database Schema
1. Connect to your database using the provided connection string
2. Run the SQL schema file from your repo to create all tables

### Step 3: Deploy Backend Service
1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `mannsetu-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Java`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/stress-monitoring-0.0.1-SNAPSHOT.jar`
   - **Plan:** Free

5. **Add Environment Variables:**
   ```
   DB_URL=<Your PostgreSQL Internal URL from Step 1>
   DB_USERNAME=<Your PostgreSQL username>
   DB_PASSWORD=<Your PostgreSQL password>
   JWT_SECRET=sih26094supersecretjwtkeythisshouldbelongandrandomforthehackathon
   JWT_EXPIRATION_MS=86400000
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   AI_SERVICE_URL=http://localhost:8000
   ```

6. Click **Create Web Service**
7. Wait for deployment to complete (5-10 minutes)
8. **Save your backend URL:** `https://mannsetu-backend.onrender.com`

### Step 4: Test Backend
Visit: `https://mannsetu-backend.onrender.com/actuator/health`

You should see:
```json
{"status":"UP"}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Push Code to GitHub
```bash
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other (static)
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** (leave empty for static files)
   - **Output Directory:** (leave empty)

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://mannsetu-backend.onrender.com/api/v1
   VITE_AI_SERVICE_URL=http://localhost:8000/ai/v1
   ```

6. Click **Deploy**

### Step 3: Update Backend CORS
Once your Vercel URL is ready (e.g., `https://mannsetu-app.vercel.app`):

1. Go back to Render dashboard
2. Open your backend service
3. Update environment variable:
   ```
   FRONTEND_URL=https://mannsetu-app.vercel.app
   ```
4. The service will automatically redeploy

---

## Part 3: Verify Deployment

### Test the Complete Flow:
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to sign up for a new account
3. Try to log in
4. Check browser console for any errors

### Common Issues:

**Issue: "Unable to fetch" error**
- **Cause:** Backend is not running or CORS misconfigured
- **Fix:** 
  - Verify backend health endpoint works
  - Check FRONTEND_URL in backend matches your Vercel URL exactly
  - Check browser console for CORS errors

**Issue: Backend is slow on first request**
- **Cause:** Render free tier spins down after 15 minutes of inactivity
- **Solution:** First request will take 30-60 seconds to wake up the service

**Issue: Database connection errors**
- **Cause:** Wrong DB credentials
- **Fix:** Double-check DB_URL, DB_USERNAME, and DB_PASSWORD in Render

---

## Part 4: Update vercel.json (Alternative Approach)

If you want to use Vercel as a proxy (not recommended for free tier), update `vercel.json`:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://mannsetu-backend.onrender.com/api/v1/:path*"
    }
  ]
}
```

Then set environment variable:
```
VITE_API_URL=/api/v1
```

---

## Part 5: Continuous Deployment

### Automatic Deployments:
- **Vercel:** Automatically redeploys on every push to `main`
- **Render:** Automatically redeploys on every push to `main`

### Manual Deployment:
- **Vercel:** Click "Redeploy" in Vercel dashboard
- **Render:** Click "Manual Deploy" in Render dashboard

---

## Environment Variables Summary

### Backend (Render):
```env
DB_URL=<PostgreSQL connection string>
DB_USERNAME=<DB user>
DB_PASSWORD=<DB password>
JWT_SECRET=<your-secret-key>
JWT_EXPIRATION_MS=86400000
FRONTEND_URL=https://your-app.vercel.app
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (Vercel):
```env
VITE_API_URL=https://mannsetu-backend.onrender.com/api/v1
VITE_AI_SERVICE_URL=http://localhost:8000/ai/v1
```

---

## Alternative Hosting Options

### Backend Alternatives:
- **Railway.app** - Similar to Render, easy setup
- **Heroku** - Classic PaaS, requires credit card even for free tier
- **AWS Elastic Beanstalk** - More complex, production-ready
- **DigitalOcean App Platform** - Good balance of simplicity and features

### Frontend Alternatives:
- **Netlify** - Similar to Vercel
- **Cloudflare Pages** - Very fast CDN
- **GitHub Pages** - Free but limited features
- **Firebase Hosting** - Good for apps with Firebase backend

---

## Troubleshooting

### Check Backend Logs:
1. Go to Render dashboard
2. Open your backend service
3. Click **Logs** tab
4. Look for errors

### Check Frontend Logs:
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Look for network errors
4. Check **Network** tab for failed requests

### Database Issues:
1. Verify database is running in Render
2. Test connection using a PostgreSQL client
3. Check if schema was applied correctly

---

## Production Checklist

Before going live:
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update all default passwords
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Set up monitoring (Render provides basic monitoring)
- [ ] Configure custom domain (optional)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Test all user flows (signup, login, check-ins, alerts)
- [ ] Load test the backend
- [ ] Set up backups for PostgreSQL database

---

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test backend endpoints directly using Postman or curl

---

**Last Updated:** 2026-09-08
