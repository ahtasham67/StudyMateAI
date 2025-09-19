#!/bin/bash

# Unified startup script for StudyMateAI
# Starts both Nginx (frontend) and Spring Boot (backend) in one container

echo "🚀 Starting StudyMateAI Unified Service..."

# Use provided PORT or default to 8080
PORT=${PORT:-8080}
BACKEND_PORT=$((PORT + 1))

# Replace placeholders in nginx config
echo "⚙️  Configuring Nginx for dynamic ports..."
sed -i "s/__FRONTEND_PORT__/${PORT}/g" /etc/nginx/nginx.conf
sed -i "s/__BACKEND_PORT__/${BACKEND_PORT}/g" /etc/nginx/nginx.conf

# Start Nginx in background
echo "📱 Starting Nginx frontend server on port $PORT..."
nginx &
NGINX_PID=$!

# Wait a moment for nginx to start
sleep 2

# Start Spring Boot backend
echo "⚡ Starting Spring Boot backend server on port $BACKEND_PORT..."
export SERVER_PORT=$BACKEND_PORT
java $JAVA_OPTS -Dserver.port=$BACKEND_PORT -jar /app/app.jar &
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
echo "🌐 Frontend: http://localhost:$PORT"
echo "🔌 Backend: http://localhost:$BACKEND_PORT"
echo "📊 Health: http://localhost:$PORT/api/actuator/health"

# Wait for either process to exit
wait
