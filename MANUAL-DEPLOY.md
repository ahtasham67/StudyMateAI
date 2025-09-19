# StudyMateAI - FREE Render Deployment Guide

# No blueprint needed - Manual service creation for FREE tier

## 🆓 FREE Deployment Steps (No Payment Required)

### Step 1: Create Web Service Manually

1. Go to [render.com](https://render.com) and sign up (FREE)
2. Click "New" → "Web Service" (NOT Blueprint)
3. Connect your GitHub repository: `ahtasham67/StudyMateAI`
4. Configure as follows:

### Step 2: Service Configuration

```
Name: studymate-app
Runtime: (Leave blank - auto-detect)
Region: Choose closest to you
Branch: main
Root Directory: (Leave blank)
```

### Step 3: Build & Start Commands

```
Build Command:
cd frontend && npm install && npm run build && mkdir -p ../backend/src/main/resources/static && cp -r build/* ../backend/src/main/resources/static/ && cd ../backend && mvn clean package -DskipTests

Start Command:
java $JAVA_OPTS -Dserver.port=$PORT -jar backend/target/*.jar
```

### Step 4: Environment Variables

Add these in the Environment section:

```bash
PORT=10000
JAVA_OPTS=-Xmx400m -XX:+UseContainerSupport -XX:+UseG1GC
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres.vfhswjfjwqjmpcxjgedc
SPRING_DATASOURCE_PASSWORD=ahtasham2105067
JWT_SECRET=studymate-free-jwt-secret-key-2024-render-single-url
JWT_EXPIRATION=86400000
GEMINI_API_KEY=AIzaSyA2DsN6bTwwuySdLO-VkPwuaKBW19ShbSk
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
CORS_ALLOWED_ORIGINS=*
FILE_UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=10MB
```

### Step 5: Deploy Settings

```
Auto-Deploy: Yes
Health Check Path: /api/actuator/health
Plan: Free (automatically selected)
```

### Step 6: Deploy!

- Click "Create Web Service"
- Wait 5-8 minutes for build
- Your app: `https://studymate-app.onrender.com`

## 🎯 Why Manual Instead of Blueprint?

- ✅ No blueprint parsing issues
- ✅ Direct service creation
- ✅ Better control over settings
- ✅ Avoids runtime validation errors
- ✅ 100% FREE tier compatible

## 🌐 Expected Result

Single URL with everything:

- Frontend: `https://studymate-app.onrender.com/`
- API: `https://studymate-app.onrender.com/api/`
- Health: `https://studymate-app.onrender.com/api/actuator/health`

This approach bypasses the blueprint validation and should work perfectly on the free tier!
