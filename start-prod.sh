#!/bin/bash

# StudyMateAI - Production Build and Start Script
# This script builds both applications and starts them in production mode

echo "🏭 Building and Starting StudyMateAI for Production..."
echo "==================================================="

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down production servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    echo "👋 Production session ended!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🔧 Building Backend..."
cd "$BACKEND_DIR"
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi

echo "🎨 Building Frontend..."
cd "$FRONTEND_DIR"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🚀 Starting Production Backend..."
cd "$BACKEND_DIR"
java -jar target/*.jar &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 10

echo ""
echo "🎉 Production Backend is running!"
echo "================================="
echo "🔧 Backend API: http://localhost:8080"
echo "📁 Frontend Build: Available in frontend/build/"
echo ""
echo "📝 To serve the frontend, you can use a web server like nginx or serve it with:"
echo "   cd frontend && npx serve -s build -l 3000"
echo ""
echo "Press Ctrl+C to stop the backend server"

# Wait for backend process
wait $BACKEND_PID
