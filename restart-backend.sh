#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Find and kill the backend server process
BACKEND_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')

if [ ! -z "$BACKEND_PID" ]; then
  echo "📍 Found backend server running on PID: $BACKEND_PID"
  echo "🛑 Stopping backend server..."
  kill $BACKEND_PID
  sleep 2
  echo "✅ Backend server stopped"
else
  echo "ℹ️  No backend server found running"
fi

echo ""
echo "🚀 Starting backend server..."
cd backend
npm start
