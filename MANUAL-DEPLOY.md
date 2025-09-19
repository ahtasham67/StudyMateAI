# StudyMateAI - FREE Render Deployment Guide
# No blueprint needed - Manual service creation for FREE tier

## 🆓 FREE Deployment Steps (No Payment Required)

### Step 1: Create Web Service Manually
1. Go to [render.com](https://render.com) and sign up (FREE)
2. Click "New" → "Web Service" (NOT Blueprint)
3. Connect your GitHub repository: `ahtasham67/StudyMateAI`

### Step 2: Basic Configuration
Fill in the main form:
```
Name: studymate-app
Runtime: (Leave blank - auto-detect from pom.xml)
Region: Choose closest to you (e.g., Oregon USA)
Branch: main
Root Directory: (Leave blank)
```

### Step 3: Build Command
In the "Build Command" field, enter:
```
cd frontend && npm install && npm run build && mkdir -p ../backend/src/main/resources/static && cp -r build/* ../backend/src/main/resources/static/ && cd ../backend && mvn clean package -DskipTests
```

### Step 4: Advanced Settings
Click "Advanced" to expand more options:

**Start Command:**
```
java $JAVA_OPTS -Dserver.port=$PORT -jar backend/target/*.jar
```

**Auto-Deploy:** Toggle ON

**Health Check Path:** 
```
/api/actuator/health
```

### Step 5: Environment Variables
Scroll down to "Environment Variables" section and click "Add Environment Variable" for each:

```
KEY: PORT                VALUE: 10000
KEY: JAVA_OPTS          VALUE: -Xmx400m -XX:+UseContainerSupport -XX:+UseG1GC
KEY: SPRING_PROFILES_ACTIVE VALUE: production
KEY: SPRING_DATASOURCE_URL VALUE: jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres
KEY: SPRING_DATASOURCE_USERNAME VALUE: postgres.vfhswjfjwqjmpcxjgedc
KEY: SPRING_DATASOURCE_PASSWORD VALUE: ahtasham2105067
KEY: JWT_SECRET         VALUE: studymate-free-jwt-secret-key-2024
KEY: JWT_EXPIRATION     VALUE: 86400000
KEY: GEMINI_API_KEY     VALUE: AIzaSyA2DsN6bTwwuySdLO-VkPwuaKBW19ShbSk
KEY: GEMINI_API_URL     VALUE: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent
KEY: SPRING_JPA_HIBERNATE_DDL_AUTO VALUE: update
KEY: SPRING_JPA_SHOW_SQL VALUE: false
KEY: CORS_ALLOWED_ORIGINS VALUE: *
KEY: FILE_UPLOAD_DIR    VALUE: /tmp/uploads
KEY: MAX_FILE_SIZE      VALUE: 10MB
KEY: MAX_REQUEST_SIZE   VALUE: 10MB
```

### Step 6: Select FREE Plan
- Plan will automatically be set to "Free" (no payment required)
- This gives you 750 hours/month

### Step 7: Deploy!
1. Click "Create Web Service"
2. Wait 5-8 minutes for build and deployment
3. Your app will be live at: `https://studymate-app.onrender.com`

## 🎯 Current Render Interface Notes

- **Build Command**: Found in the main form
- **Start Command**: Under "Advanced" section
- **Environment Variables**: Separate section below Advanced
- **Health Check**: Under "Advanced" section
- **Auto-Deploy**: Toggle in "Advanced" section

## 🌐 Expected Result

Single URL with everything:
- **Frontend**: `https://studymate-app.onrender.com/`
- **API**: `https://studymate-app.onrender.com/api/`
- **Health Check**: `https://studymate-app.onrender.com/api/actuator/health`

## 🔍 Troubleshooting

If build fails:
1. Check the build logs in Render dashboard
2. Ensure all environment variables are set correctly
3. Verify the build command is entered as one line

## ✅ Why Manual Deployment Works

- ✅ No blueprint parsing issues
- ✅ Direct control over all settings
- ✅ Current Render interface compatible
- ✅ 100% FREE tier friendly
- ✅ Single URL for entire application

This approach bypasses all blueprint validation issues and works with Render's current interface!