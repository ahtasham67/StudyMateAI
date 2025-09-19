# Render Deployment Instructions for StudyMateAI

## 🚀 Quick Start Guide

### 1. Prepare Your Repository

```bash
# Ensure all deployment files are in your repository
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create Render Account

- Go to [render.com](https://render.com) and sign up
- Connect your GitHub account
- Give Render access to your StudyMateAI repository

### 3. Deploy with Blueprint (Recommended)

#### Option A: One-Click Deploy

```bash
# Go to Render Dashboard
# Click "New" → "Blueprint"
# Select your StudyMateAI repository
# Render will automatically read render.yaml and deploy both services
```

#### Option B: Manual Deploy

If you prefer manual control, follow these steps:

##### Backend Service

1. **Create Web Service**:

   - Name: `studymate-backend`
   - Runtime: `Docker`
   - Build command: (leave empty)
   - Start command: (leave empty)
   - Dockerfile path: `./backend/Dockerfile`

2. **Environment Variables** (CRITICAL):
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   SPRING_PROFILES_ACTIVE=production
   PORT=8080
   ```

##### Frontend Service

1. **Create Web Service**:

   - Name: `studymate-frontend`
   - Runtime: `Docker`
   - Build command: (leave empty)
   - Start command: (leave empty)
   - Dockerfile path: `./frontend/Dockerfile`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   REACT_APP_API_URL=https://studymate-backend.onrender.com
   REACT_APP_WS_URL=wss://studymate-backend.onrender.com
   ```

### 4. Required Setup

#### Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key and add it to your backend service environment variables

#### Configure CORS

The backend is already configured to accept requests from your frontend URL, but make sure the CORS settings match your actual deployed frontend URL.

### 5. Deployment Process

1. **Commit and Push**: Ensure all files are pushed to GitHub
2. **Deploy**: Render will automatically build and deploy
3. **Monitor**: Check build logs in Render dashboard
4. **Test**: Access your application at the provided URLs

### 6. Expected URLs

- **Backend**: `https://studymate-backend.onrender.com`
- **Frontend**: `https://studymate-frontend.onrender.com`
- **Health Check**: `https://studymate-backend.onrender.com/actuator/health`

### 7. Monitoring

#### Check Health Status

```bash
# Backend health
curl https://studymate-backend.onrender.com/actuator/health

# Frontend health
curl https://studymate-frontend.onrender.com/health
```

#### View Logs

- Go to Render Dashboard
- Select your service
- Click on "Logs" tab
- Monitor real-time application logs

### 8. Troubleshooting

#### Common Issues:

1. **Build Failures**:

   - Check Dockerfile syntax
   - Verify all files are committed and pushed
   - Review build logs in Render dashboard

2. **Environment Variables**:

   - Ensure GEMINI_API_KEY is correctly set
   - Verify all required environment variables are present
   - Check for typos in variable names

3. **Database Connection**:

   - Your Supabase database is already configured
   - Connection credentials are in application.properties
   - Check Supabase dashboard for connection status

4. **CORS Issues**:
   - Verify frontend URL in backend CORS configuration
   - Check browser console for CORS errors
   - Ensure URLs match exactly (https vs http)

#### Support Resources:

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Application Logs**: Available in Render dashboard
- **Health Endpoints**: Monitor service status

### 🎉 Success!

Once deployed, your StudyMateAI application will be live and accessible to users worldwide with:

- ✅ Secure HTTPS connections
- ✅ Auto-scaling infrastructure
- ✅ Continuous deployment from GitHub
- ✅ Professional production environment

**Your AI-powered study platform is now live on the internet!** 🌐
