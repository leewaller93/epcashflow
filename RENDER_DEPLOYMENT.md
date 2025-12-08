# Render Deployment Guide

This guide explains how to deploy the Cash Flow application to Render.

## Prerequisites

1. A GitHub account with the repository: `https://github.com/leewaller93/epcashflow.git`
2. A Render account (sign up at https://render.com)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `leewaller93/epcashflow`
   - Render will automatically detect `render.yaml` and create both services

2. **Configure Environment Variables:**
   - For the **backend** service, no additional env vars needed (uses PORT from Render)
   - For the **frontend** service, set:
     - `REACT_APP_API_URL`: `https://epcashflow-backend.onrender.com` (update with your actual backend URL)

3. **Deploy:**
   - Render will automatically build and deploy both services
   - Backend will be available at: `https://epcashflow-backend.onrender.com`
   - Frontend will be available at: `https://epcashflow-frontend.onrender.com`

### Option 2: Manual Setup

#### Backend Service

1. **Create Web Service:**
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `epcashflow-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
     - **Root Directory**: (leave empty, uses repo root)

2. **Environment Variables:**
   - `PYTHON_VERSION`: `3.11.0` (optional, Render auto-detects)

#### Frontend Service

1. **Create Web Service:**
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `epcashflow-frontend`
     - **Environment**: `Node`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Start Command**: `cd frontend && npx serve -s build -l $PORT`
     - **Root Directory**: (leave empty, uses repo root)

2. **Environment Variables:**
   - `NODE_VERSION`: `18.18.0` (optional)
   - `REACT_APP_API_URL`: `https://epcashflow-backend.onrender.com` (replace with your backend URL)

## Important Notes

### Database

⚠️ **Current Setup Uses SQLite**: The application currently uses SQLite, which has limitations on Render:
- SQLite files are stored in the filesystem, which is **ephemeral** on Render
- Data will be lost when the service restarts or redeploys
- For production use, consider migrating to PostgreSQL (Render offers free PostgreSQL)

### CORS Configuration

The backend has CORS enabled, which should work with Render. If you encounter CORS issues:
- Ensure `REACT_APP_API_URL` in frontend matches your backend URL exactly
- Check that backend allows requests from your frontend domain

### Free Tier Limitations

- Services may spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on services

## Post-Deployment

1. **Update Frontend API URL:**
   - After backend deploys, note the URL (e.g., `https://epcashflow-backend.onrender.com`)
   - Update `REACT_APP_API_URL` in frontend service environment variables
   - Redeploy frontend service

2. **Test the Application:**
   - Visit your frontend URL
   - Check browser console for any API errors
   - Test creating a contract to verify database works

3. **Monitor Logs:**
   - Use Render dashboard to view logs for both services
   - Check for any build or runtime errors

## Troubleshooting

### Backend Issues

- **Port Error**: Ensure start command uses `$PORT` (Render provides this)
- **Database Error**: SQLite may fail on first run - check logs
- **Module Not Found**: Verify `requirements.txt` includes all dependencies

### Frontend Issues

- **API Connection Failed**: Verify `REACT_APP_API_URL` is set correctly
- **Build Fails**: Check Node version compatibility
- **404 on Routes**: Ensure `serve` package is installed and start command is correct

### Common Solutions

1. **Clear Build Cache**: In Render dashboard → Settings → Clear build cache
2. **Redeploy**: Manual redeploy from dashboard
3. **Check Logs**: Review build and runtime logs for specific errors

## Next Steps

- Consider setting up PostgreSQL database for persistent data
- Configure custom domains if needed
- Set up automatic deployments from main branch
- Add environment-specific configurations

