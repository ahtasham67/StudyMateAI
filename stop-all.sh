#!/bin/bash

# StudyMate - Stop All Services Script
# This script stops all running StudyMate services

echo "🛑 Stopping StudyMate Services..."
echo "================================="

# Stop processes by port
echo "Stopping backend (port 8080)..."
lsof -ti:8080 | xargs -r kill -9

echo "Stopping frontend (port 3000)..."
lsof -ti:3000 | xargs -r kill -9

# Stop any remaining Maven or npm processes
echo "Stopping Maven processes..."
pkill -f "mvn.*spring-boot:run" 2>/dev/null

echo "Stopping npm/node processes..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

echo ""
echo "✅ All StudyMate services have been stopped!"
echo "Ports 3000 and 8080 are now available."
