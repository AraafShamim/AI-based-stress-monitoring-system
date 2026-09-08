# Vercel Deployment Guide with Supabase Backend

This guide explains how to deploy your AI-based stress monitoring system to Vercel with Supabase backend integration.

## 📋 Project Structure Overview

Your project uses a **multi-service architecture**:
- **Frontend**: HTML/CSS/JavaScript (deployed to Vercel)
- **Backend**: Spring Boot Java API (deployed separately)
- **AI Service**: FastAPI Python service (deployed separately)
- **Database**: Supabase PostgreSQL (Cloud-hosted)
- **Cache**: Redis (optional)

## 🚀 Step-by-Step Vercel Deployment

### 1. **Prepare Your Repository**

The frontend files should be in the root directory. Ensure you have:
- `index.html` ✓
- `src/` directory with your frontend code ✓
- `vercel.json` ✓

### 2. **Connect to Vercel**

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
cd AI-based-stress-monitoring-system
vercel
```

**Option B: Using GitHub Integration (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Select your repository `AraafShamim/AI-based-stress-monitoring-system`
5. Vercel will auto-detect your project settings
6. Click **Deploy**

### 3. **Configure Environment Variables in Vercel Dashboard**

After deployment starts, go to **Project Settings > Environment Variables** and add:

#### **Supabase Configuration**
```
VITE_SUPABASE_URL = https://xngawuoosnepcxguezkn.supabase.co
VITE_SUPABASE_KEY = sb_publishable_wsqfRq9FCykjJJlyjjL-zA_8vzfX8GB
```

#### **Backend API Endpoints**
```
VITE_API_URL = https://your-backend-url.com/api/v1
VITE_AI_SERVICE_URL = https://your-ai-service-url.com/ai/v1
```

**Note**: These URLs should be updated AFTER you deploy your backend services.

### 4. **Update Vercel Configuration**

Your `vercel.json` is already configured with security headers. No changes needed.

### 5. **Environment-Specific Variables**

Set different variables for different environments:

**Production**
```
VITE_API_URL = https://api.yourdomain.com/api/v1
VITE_AI_SERVICE_URL = https://ai.yourdomain.com/ai/v1
VITE_SUPABASE_URL = https://xngawuoosnepcxguezkn.supabase.co
VITE_SUPABASE_KEY = sb_publishable_wsqfRq9FCykjJJlyjjL-zA_8vzfX8GB
```

**Preview (Staging)**
```
VITE_API_URL = https://staging-api.yourdomain.com/api/v1
VITE_AI_SERVICE_URL = https://staging-ai.yourdomain.com/ai/v1
```

**Development**
```
VITE_API_URL = http://localhost:8080/api/v1
VITE_AI_SERVICE_URL = http://localhost:8000/ai/v1
```

## 🔐 Supabase Configuration Details

### Supabase Project Information
```
Project URL: https://xngawuoosnepcxguezkn.supabase.co
Project ID: xngawuoosnepcxguezkn
Publishable Key: sb_publishable_wsqfRq9FCykjJJlyjjL-zA_8vzfX8GB
```

### Database Connection
```
Host: db.xngawuoosnepcxguezkn.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [YOUR-PASSWORD]
```

### Important Security Notes ⚠️

1. **Never commit `.env.local` to GitHub** - Keep it in `.gitignore`
2. **Rotate credentials** - The keys shown were posted publicly, generate new ones:
   - Go to Supabase dashboard > Project Settings
   - Regenerate API keys
   - Update all services with new credentials
3. **Use different keys for different environments**
4. **Database password** - Change immediately in Supabase > Database Settings > Password

## 🔌 Connecting Supabase to Your Frontend

### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### In Your Frontend Code
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

// Use for authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: user.email,
  password: user.password
})
```

## 🔗 Backend Deployment

Your backend services should be deployed separately. Options:

### Option 1: **Render.com** (Recommended)
- Follow the existing `DEPLOYMENT.md` guide
- Deploy PostgreSQL, Redis, AI Service, and Backend
- Get the URLs and update Vercel environment variables

### Option 2: **Railway.app**
- Similar setup to Render
- Supports Docker deployments

### Option 3: **AWS/GCP/Azure**
- More complex setup
- Greater control and scalability

## ✅ Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] `vercel.json` configured correctly
- [ ] Environment variables added to Vercel dashboard
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_KEY` set (publishable key only)
- [ ] Backend API URL configured
- [ ] AI Service URL configured
- [ ] Test frontend in production URL
- [ ] Supabase credentials rotated and secured
- [ ] Verify Supabase database connection works

## 🚨 Troubleshooting

### Build Fails on Vercel
- Check Build Logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify no hardcoded environment variables in code

### Cannot Connect to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are correct
- Check CORS settings in Supabase dashboard
- Test connection with: `curl https://xngawuoosnepcxguezkn.supabase.co`

### API Requests Failing
- Verify `VITE_API_URL` points to correct backend
- Check backend CORS configuration
- Test with Postman/Curl

### Database Connection Issues
- Verify PostgreSQL host and port
- Check database user credentials
- Ensure IP whitelist includes all service IPs

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [VITE Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 🎯 Next Steps

1. ✅ Deploy frontend to Vercel (this guide)
2. Deploy backend to Render/Railway
3. Deploy AI Service to Render/Railway
4. Configure CI/CD pipelines
5. Set up monitoring and logging
6. Configure custom domain and SSL

---

**Last Updated**: 2026-09-08
**Status**: Ready for Production Deployment
