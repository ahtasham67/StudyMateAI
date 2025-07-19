#!/bin/bash

# StudyMateAI - Development Start Script
# This script starts both backend and frontend in development mode with live reload

echo "🔥 Starting StudyMateAI in Development Mode..."
echo "============================================"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
if ! ps aux | grep -v grep | grep -q "postgres:"; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    /usr/local/opt/postgresql@14/bin/pg_ctl -D /usr/local/var/postgresql@14 -l /usr/local/var/log/postgresql@14.log start
    sleep 3
    if ! ps aux | grep -v grep | grep -q "postgres:"; then
        echo "❌ Failed to start PostgreSQL. Please start it manually."
        exit 1
    fi
    echo "✅ PostgreSQL started successfully."
else
    echo "✅ PostgreSQL is running."
fi

# Test database connection
echo "🔗 Testing database connection..."
if PGPASSWORD=123 /usr/local/opt/postgresql@14/bin/psql -U studymate -d studymate_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful."
else
    echo "❌ Cannot connect to StudyMateAI database. Please check PostgreSQL setup."
    exit 1
fi

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    jobs -p | xargs -r kill
    echo "👋 Development session ended!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🔧 Starting Backend Development Server..."
cd "$BACKEND_DIR"

# Start backend with live reload in background
(mvn spring-boot:run -Dspring-boot.run.fork=true) &

echo "⏳ Waiting for backend to start..."
sleep 15

echo "🎨 Starting Frontend Development Server..."
cd "$FRONTEND_DIR"

# Start frontend with live reload in background
(npm start) &

echo ""
echo "🎉 Development servers are starting..."
echo "======================================"
echo "📱 Frontend: http://localhost:3000 (with hot reload)"
echo "🔧 Backend: http://localhost:8080 (with auto-restart)"
echo ""
echo "📝 Both servers support live reload - your changes will be reflected automatically!"
echo "Press Ctrl+C to stop all development servers"

# Wait for all background jobs
wait
