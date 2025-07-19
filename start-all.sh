#!/bin/bash

# StudyMate - Start All Services Script
# This script starts both backend and frontend services

echo "🚀 Starting StudyMate Application..."
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists java; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

if ! command_exists mvn; then
    echo "❌ Maven is not installed. Please install Maven."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
if ! ps aux | grep -v grep | grep -q "postgres:"; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    if command_exists brew; then
        /usr/local/opt/postgresql@14/bin/pg_ctl -D /usr/local/var/postgresql@14 -l /usr/local/var/log/postgresql@14.log start
        sleep 3
        if ! ps aux | grep -v grep | grep -q "postgres:"; then
            echo "❌ Failed to start PostgreSQL. Please start it manually."
            exit 1
        fi
        echo "✅ PostgreSQL started successfully."
    else
        echo "❌ PostgreSQL is not running and Homebrew is not available. Please start PostgreSQL manually."
        exit 1
    fi
else
    echo "✅ PostgreSQL is running."
fi

# Test database connection
echo "🔗 Testing database connection..."
if PGPASSWORD=123 /usr/local/opt/postgresql@14/bin/psql -U studymate -d studymate_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful."
else
    echo "❌ Cannot connect to StudyMate database. Please check PostgreSQL setup."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ All prerequisites found!"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Backend
echo ""
echo "🔧 Starting Backend (Spring Boot)..."
cd "$BACKEND_DIR"

# Check if backend dependencies are installed
if [ ! -d "target" ]; then
    echo "📦 Installing backend dependencies..."
    mvn clean install -q
fi

# Start backend in background
echo "🚀 Starting backend server on http://localhost:8080..."
mvn spring-boot:run -Dspring-boot.run.fork=true > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

echo "✅ Backend started successfully!"

# Start Frontend
echo ""
echo "🎨 Starting Frontend (React)..."
cd "$FRONTEND_DIR"

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --silent
fi

# Start frontend in background
echo "🚀 Starting frontend server on http://localhost:3000..."
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start. Check frontend.log for details."
    cleanup
fi

echo "✅ Frontend started successfully!"

echo ""
echo "🎉 StudyMate is now running!"
echo "=================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "📋 Backend Logs: $BACKEND_DIR/backend.log"
echo "📋 Frontend Logs: $FRONTEND_DIR/frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and wait for user interrupt
while true; do
    sleep 1
    
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend process died unexpectedly!"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend process died unexpectedly!"
        cleanup
    fi
done
