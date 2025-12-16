#!/bin/bash

# Socket.io Testing Guide
# This script helps you test the Socket.io implementation

echo "🧪 UniEd Socket.io Testing Guide"
echo "================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "❌ Backend server is not running!"
    echo ""
    echo "Please start the server first:"
    echo "  cd backend && npm run dev"
    echo ""
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Step 1: Register a test user
echo "Step 1: Registering test user..."
echo "================================"

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sockettest@unied.com",
    "password": "password123",
    "role": "student",
    "firstName": "Socket",
    "lastName": "Tester",
    "studentId": "SOCK001",
    "department": "Computer Science",
    "semester": 1
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Step 2: Login
echo "Step 2: Logging in..."
echo "===================="

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sockettest@unied.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token"
    echo "The user might already exist. Try logging in with existing credentials."
    echo ""
    
    # Try login with test@unied.com
    echo "Trying with test@unied.com..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@unied.com",
        "password": "password123"
      }')
    
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)
fi

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Still failed to get access token"
    echo "Please register a user manually and try again."
    exit 1
fi

echo "✅ Access token obtained!"
echo ""

# Step 3: Test Socket.io connection
echo "Step 3: Testing Socket.io connection"
echo "====================================="
echo ""
echo "📝 Your access token is:"
echo "$ACCESS_TOKEN"
echo ""
echo "Now you can test Socket.io in two ways:"
echo ""
echo "Option 1: Using the test script"
echo "--------------------------------"
echo "1. Open test-socket.js"
echo "2. Replace 'YOUR_ACCESS_TOKEN' with the token above"
echo "3. Run: node test-socket.js"
echo ""
echo "Option 2: Using browser console"
echo "--------------------------------"
echo "1. Open your browser console (F12)"
echo "2. Paste this code:"
echo ""
echo "const socket = io('http://localhost:5001', {"
echo "  auth: { token: '$ACCESS_TOKEN' }"
echo "});"
echo ""
echo "socket.on('connect', () => {"
echo "  console.log('✅ Connected!');"
echo "  socket.emit('join:notifications');"
echo "  socket.emit('join:chat');"
echo "});"
echo ""
echo "socket.on('new:notification', (n) => console.log('📢', n));"
echo "socket.on('new:message', (m) => console.log('💬', m));"
echo ""
echo "Option 3: Using curl (for HTTP endpoints)"
echo "-----------------------------------------"
echo "Test authenticated endpoint:"
echo ""
echo "curl http://localhost:5001/api/v1/auth/profile \\"
echo "  -H 'Authorization: Bearer $ACCESS_TOKEN'"
echo ""
echo "================================="
echo "✅ Setup complete! Happy testing!"
echo "================================="
