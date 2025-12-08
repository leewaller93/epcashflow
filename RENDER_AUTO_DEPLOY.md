# How to Enable Auto-Deploy on Render

## Current Setup
You have a Blueprint named "epcashflow" that manages both your frontend and backend services.

## Enable Auto-Deploy for Both Services

### Option 1: Enable via Blueprint (Recommended)

1. **Go to your Blueprint:**
   - Click on "epcashflow" in the Blueprints list
   - This will show both services (epcashflow-backend and epcashflow-frontend)

2. **Enable Auto-Deploy for Backend:**
   - Click on the **"epcashflow-backend"** service
   - Go to **"Settings"** (in the left sidebar)
   - Scroll down to **"Auto-Deploy"** section
   - Toggle **"Auto-Deploy"** to **"Yes"**
   - Make sure **"Branch"** is set to **"main"**
   - Click **"Save Changes"**

3. **Enable Auto-Deploy for Frontend:**
   - Go back to the Blueprint view
   - Click on the **"epcashflow-frontend"** service
   - Go to **"Settings"**
   - Scroll down to **"Auto-Deploy"** section
   - Toggle **"Auto-Deploy"** to **"Yes"**
   - Make sure **"Branch"** is set to **"main"**
   - Click **"Save Changes"**

### Option 2: Update render.yaml (Alternative)

The render.yaml file can also specify auto-deploy settings. However, Render's UI settings take precedence.

## How It Works After Enabling

Once auto-deploy is enabled:
- ✅ Every time you push code to GitHub (main branch), both services will automatically redeploy
- ✅ You'll see deployment status in the Render dashboard
- ✅ No need to manually trigger deployments anymore

## Verify Auto-Deploy is Working

1. Make a small change to your code
2. Push to GitHub: `git push origin main`
3. Check Render dashboard - you should see both services start deploying automatically within 1-2 minutes

## Manual Deploy (If Needed)

You can still manually deploy if needed:
- Go to service → "Manual Deploy" → "Deploy latest commit"

## Troubleshooting

- **Auto-deploy not working?** Check that:
  - Auto-deploy is set to "Yes" in Settings
  - Branch is set to "main" (or your default branch)
  - GitHub repository is properly connected
  - You're pushing to the correct branch

- **Only one service deploying?** Make sure both services have auto-deploy enabled individually

