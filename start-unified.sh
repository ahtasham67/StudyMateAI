#!/bin/bash

# Unified startup script for StudyMateAI
# Starts both Nginx (frontend) and Spring Boot (backend) in one container

echo "🚀 Starting StudyMateAI Unified Service..."

# Start Nginx in background
echo "📱 Starting Nginx frontend server..."
nginx &
NGINX_PID=$!

# Wait a moment for nginx to start
sleep 2

# Start Spring Boot backend on port 8081 (nginx proxies from 8080 to 8081)
echo "⚡ Starting Spring Boot backend server..."
export SERVER_PORT=8081
java $JAVA_OPTS -Dserver.port=8081 -jar app.jar &
BACKEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $NGINX_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGTERM SIGINT

echo "✅ StudyMateAI services started successfully!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔌 Backend: http://localhost:8081"
echo "📊 Health: http://localhost:8080/api/actuator/health"

# Wait for either process to exit
wait