/**
 * Socket.io Test Script
 * 
 * This script tests the Socket.io real-time features.
 * 
 * Prerequisites:
 * 1. Backend server must be running (npm run dev)
 * 2. You need a valid JWT access token (login first)
 * 
 * Usage:
 * 1. First, get a token by logging in:
 *    curl -X POST http://localhost:5001/api/v1/auth/login \
 *      -H "Content-Type: application/json" \
 *      -d '{"email":"test@unied.com","password":"password123"}'
 * 
 * 2. Copy the accessToken from the response
 * 
 * 3. Replace YOUR_ACCESS_TOKEN below with your actual token
 * 
 * 4. Run: node test-socket.js
 */

import { io } from 'socket.io-client';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL ACCESS TOKEN
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

// Connect to Socket.io server
const socket = io('http://localhost:5001', {
  auth: {
    token: ACCESS_TOKEN
  }
});

console.log('🔌 Connecting to Socket.io server...\n');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server!');
  console.log(`📝 Socket ID: ${socket.id}\n`);
  
  runTests();
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Backend server is running (npm run dev)');
  console.log('   2. You have a valid access token');
  console.log('   3. Token is not expired (15 min expiry)\n');
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('\n❌ Disconnected from server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Test functions
function runTests() {
  console.log('🧪 Running Socket.io tests...\n');
  
  // Test 1: Join notifications
  testNotifications();
  
  // Test 2: Join chat (after 2 seconds)
  setTimeout(testChat, 2000);
  
  // Test 3: Join class (after 4 seconds)
  setTimeout(testClass, 4000);
  
  // Test 4: Join announcements (after 6 seconds)
  setTimeout(testAnnouncements, 6000);
  
  // Disconnect after 10 seconds
  setTimeout(() => {
    console.log('\n✅ All tests completed!');
    console.log('👋 Disconnecting...\n');
    socket.disconnect();
    process.exit(0);
  }, 10000);
}

function testNotifications() {
  console.log('📢 TEST 1: Notifications');
  console.log('   → Joining notifications room...');
  
  socket.emit('join:notifications');
  
  socket.on('notifications:joined', (data) => {
    console.log('   ✅ Joined:', data.room);
  });
  
  socket.on('new:notification', (notification) => {
    console.log('   📬 New notification:', notification.title);
  });
  
  console.log('');
}

function testChat() {
  console.log('💬 TEST 2: Chat');
  console.log('   → Joining chat room...');
  
  socket.emit('join:chat');
  
  socket.on('chat:joined', (data) => {
    console.log('   ✅ Joined:', data.room);
  });
  
  socket.on('new:message', (message) => {
    console.log('   📨 New message from:', message.sender.fullName);
    console.log('      Message:', message.message);
  });
  
  console.log('');
}

function testClass() {
  console.log('🎓 TEST 3: Live Class');
  console.log('   → Joining class room (courseId: test-course-123)...');
  
  const courseId = 'test-course-123';
  
  socket.emit('join:class', courseId);
  
  socket.on('class:joined', (data) => {
    console.log('   ✅ Joined class:', data.classId);
    console.log('   👥 Participants:', data.participantCount);
  });
  
  socket.on('class:participant:joined', (data) => {
    console.log('   👤 Participant joined:', data.userName);
  });
  
  socket.on('class:participant:left', (data) => {
    console.log('   👋 Participant left:', data.userName);
  });
  
  socket.on('class:update', (update) => {
    console.log('   📢 Class update:', update.update);
  });
  
  console.log('');
}

function testAnnouncements() {
  console.log('📣 TEST 4: Announcements');
  console.log('   → Joining announcement channels...');
  
  socket.emit('join:announcements', { courseId: 'test-course-123' });
  
  socket.on('announcements:joined', (data) => {
    console.log('   ✅ Joined channels:', data.channels.join(', '));
  });
  
  socket.on('new:announcement', (announcement) => {
    console.log('   📢 New announcement:', announcement.title);
  });
  
  console.log('');
}

// Listen for all events (for debugging)
socket.onAny((eventName, ...args) => {
  if (!['connect', 'disconnect'].includes(eventName)) {
    console.log(`   📡 Event received: ${eventName}`);
  }
});
