# Render Environment Variables Reference

## Backend Service Environment Variables

**No environment variables required!** 

The backend automatically uses:
- `PORT` - Automatically provided by Render (you don't need to set this)
- `HOST` - Defaults to `0.0.0.0` (works on Render automatically)

**Optional (not required):**
- `PYTHON_VERSION` = `3.11.0` (Render usually auto-detects this)

---

## Frontend Service Environment Variables

**REQUIRED:**
- `REACT_APP_API_URL` = `https://YOUR-BACKEND-URL.onrender.com`
  - Replace `YOUR-BACKEND-URL` with your actual backend service name
  - Example: `https://epcashflow-backend.onrender.com`
  - ⚠️ **Important**: No trailing slash at the end!

**Optional:**
- `NODE_VERSION` = `18.18.0` (Render usually auto-detects this)

---

## Quick Setup

### Backend:
**No environment variables needed** - just deploy it!

### Frontend:
1. Deploy backend first
2. Copy the backend URL (e.g., `https://epcashflow-backend.onrender.com`)
3. In frontend service settings, add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://epcashflow-backend.onrender.com` (your actual URL)

---

## Example

If your backend service is named `epcashflow-backend`:
- Backend URL will be: `https://epcashflow-backend.onrender.com`
- Frontend environment variable:
  - Key: `REACT_APP_API_URL`
  - Value: `https://epcashflow-backend.onrender.com`

