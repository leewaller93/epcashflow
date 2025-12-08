# Render Manual Deployment Guide (Step-by-Step)

This guide walks you through deploying manually on Render without using Blueprints.

## Step 1: Deploy the Backend First

### 1.1 Create Backend Web Service
1. Go to https://dashboard.render.com
2. Click the **"New +"** button (top right)
3. Select **"Web Service"**

### 1.2 Connect Your Repository
1. Under "Connect a repository", click **"Connect account"** if you haven't already
2. Authorize Render to access your GitHub account
3. Select your repository: **`leewaller93/epcashflow`**
4. Click **"Connect"**

### 1.3 Configure Backend Service
Fill in these settings:

**Basic Settings:**
- **Name**: `epcashflow-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Oregon (us-west)`)
- **Branch**: `main`
- **Root Directory**: Leave **empty** (uses repo root)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`

**Plan:**
- Select **"Free"** (or paid if you prefer)

### 1.4 Add Environment Variables (Optional)
Click "Advanced" → "Environment Variables" and add:
- `PYTHON_VERSION`: `3.11.0` (optional, Render auto-detects)

### 1.5 Deploy Backend
1. Click **"Create Web Service"** at the bottom
2. Wait for deployment to complete (2-5 minutes)
3. **Copy the URL** - it will look like: `https://epcashflow-backend.onrender.com`
   - ⚠️ **IMPORTANT**: Save this URL - you'll need it for the frontend!

---

## Step 2: Deploy the Frontend

### 2.1 Create Frontend Web Service
1. Still in Render dashboard, click **"New +"** again
2. Select **"Web Service"**

### 2.2 Connect Same Repository
1. Select the same repository: **`leewaller93/epcashflow`**
2. Click **"Connect"**

### 2.3 Configure Frontend Service
Fill in these settings:

**Basic Settings:**
- **Name**: `epcashflow-frontend` (or any name you prefer)
- **Region**: Same as backend (e.g., `Oregon (us-west)`)
- **Branch**: `main`
- **Root Directory**: Leave **empty**
- **Runtime**: `Node`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npx serve -s build -l $PORT`

**Plan:**
- Select **"Free"** (or paid if you prefer)

### 2.4 Add Environment Variables (REQUIRED)
Click "Advanced" → "Environment Variables" and add:

**IMPORTANT**: Replace `YOUR_BACKEND_URL` with the actual backend URL you copied in Step 1.5

- **Key**: `REACT_APP_API_URL`
- **Value**: `https://epcashflow-backend.onrender.com` (use YOUR actual backend URL)

Also add (optional):
- **Key**: `NODE_VERSION`
- **Value**: `18.18.0`

### 2.5 Deploy Frontend
1. Click **"Create Web Service"** at the bottom
2. Wait for deployment to complete (3-7 minutes)

---

## Step 3: Test Your Deployment

1. **Visit your frontend URL** (e.g., `https://epcashflow-frontend.onrender.com`)
2. Open browser developer tools (F12) → Console tab
3. Check for any errors
4. Try creating a contract to test the API connection

---

## Troubleshooting

### Backend Won't Start
- Check the logs in Render dashboard
- Verify the start command is exactly: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
- Make sure `gunicorn` is in `backend/requirements.txt`

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` matches your backend URL exactly
- Check browser console for CORS errors
- Make sure backend URL doesn't have a trailing slash

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json` (frontend) or `requirements.txt` (backend)
- Try clearing build cache: Settings → Clear build cache → Redeploy

### Services Keep Spinning Down
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid plan for always-on services

---

## Quick Reference

### Backend Settings Summary:
```
Name: epcashflow-backend
Build: pip install -r backend/requirements.txt
Start: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

### Frontend Settings Summary:
```
Name: epcashflow-frontend
Build: cd frontend && npm install && npm run build
Start: cd frontend && npx serve -s build -l $PORT
Environment: REACT_APP_API_URL = https://YOUR-BACKEND-URL.onrender.com
```

---

## Need Help?

- Check Render logs: Dashboard → Your Service → Logs
- Render Docs: https://render.com/docs
- Common Issues: See RENDER_DEPLOYMENT.md for more details

