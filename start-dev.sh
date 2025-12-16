#!/bin/bash

# UniEd Development Server Startup Script

echo "🚀 Starting UniEd Development Environment..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for MongoDB
echo "📊 Checking MongoDB..."
if command_exists mongod; then
    # Check if MongoDB is already running
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is already running"
    else
        echo "🔧 Starting MongoDB..."
        # Try to start with Homebrew services (macOS)
        if command_exists brew; then
            brew services start mongodb-community 2>/dev/null || {
                echo "⚠️  Could not start MongoDB with brew services"
                echo "   Please start MongoDB manually: mongod"
            }
        else
            echo "⚠️  Please start MongoDB manually: mongod"
        fi
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB first."
    echo "   Visit: https://www.mongodb.com/docs/manual/installation/"
fi

echo ""
echo "🔧 Installing dependencies..."

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "🎯 Starting servers..."
echo ""

# Start backend in background
echo "🔌 Starting Backend Server (http://localhost:5001)..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server (http://localhost:8080)..."
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Backend:  http://localhost:5001"
echo "  Frontend: http://localhost:8080"
echo "  API Docs: http://localhost:5001/api/v1"
echo "  Health:   http://localhost:5001/health"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📝 Backend logs are being written to backend.log"
echo "⌨️  Press Ctrl+C to stop all servers"
echo ""

cd frontend

# Trap Ctrl+C to kill both processes
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID 2>/dev/null; exit 0' INT

# Start frontend (this will run in foreground)
npm run dev

# If frontend exits, kill backend
kill $BACKEND_PID 2>/dev/null
