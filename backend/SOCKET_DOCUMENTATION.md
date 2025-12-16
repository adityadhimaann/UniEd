# Socket.io Real-time Features Documentation

## Connection

### Client-side Setup (Frontend)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: 'your-jwt-access-token'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Events Reference

### 1. NOTIFICATIONS

#### Join Notifications Room
```javascript
// Client emits
socket.emit('join:notifications');

// Server responds
socket.on('notifications:joined', (data) => {
  console.log(data); // { success: true, message: '...', room: 'notifications:userId' }
});

// Receive new notification
socket.on('new:notification', (notification) => {
  console.log(notification);
  // {
  //   _id: '...',
  //   type: 'assignment' | 'grade' | 'announcement' | 'message',
  //   title: 'New Assignment Posted',
  //   content: 'Assignment details...',
  //   link: '/assignments/123',
  //   isRead: false,
  //   createdAt: '2024-...'
  // }
});
```

#### Mark Notification as Read
```javascript
socket.emit('notification:read', notificationId);

socket.on('notification:read:success', (data) => {
  console.log('Notification marked as read:', data.notificationId);
});
```

#### Leave Notifications Room
```javascript
socket.emit('leave:notifications');
```

---

### 2. MESSAGES / CHAT

#### Join Chat Room
```javascript
socket.emit('join:chat');

socket.on('chat:joined', (data) => {
  console.log(data); // { success: true, message: '...', room: 'chat:userId' }
});

// Receive new message
socket.on('new:message', (message) => {
  console.log(message);
  // {
  //   senderId: '...',
  //   sender: {
  //     _id: '...',
  //     email: '...',
  //     fullName: 'John Doe',
  //     avatar: 'url'
  //   },
  //   message: 'Hello!',
  //   timestamp: '2024-...'
  // }
});
```

#### Send Message
```javascript
socket.emit('message:send', {
  receiverId: 'userId',
  message: 'Hello, how are you?'
});

socket.on('message:sent', (data) => {
  console.log('Message sent successfully:', data);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', receiverId);

// Stop typing
socket.emit('typing:stop', receiverId);

// Listen for others typing
socket.on('user:typing', (data) => {
  console.log(`${data.userName} is typing...`);
});

socket.on('user:typing:stop', (data) => {
  console.log(`User ${data.userId} stopped typing`);
});
```

#### Mark Message as Read
```javascript
socket.emit('message:read', messageId);

socket.on('message:read:success', (data) => {
  console.log('Message marked as read:', data.messageId);
});
```

---

### 3. LIVE CLASS / COURSE

#### Join Class Room
```javascript
socket.emit('join:class', courseId);

socket.on('class:joined', (data) => {
  console.log(data);
  // {
  //   success: true,
  //   classId: '...',
  //   room: 'class:courseId',
  //   participantCount: 25
  // }
});

// Listen for participants joining
socket.on('class:participant:joined', (data) => {
  console.log(`${data.userName} joined (${data.participantCount} participants)`);
});

// Listen for participants leaving
socket.on('class:participant:left', (data) => {
  console.log(`${data.userName} left (${data.participantCount} participants)`);
});
```

#### Class Updates (Faculty only)
```javascript
// Faculty sends update
socket.emit('class:update', {
  classId: courseId,
  update: {
    type: 'announcement',
    message: 'Class will start in 5 minutes'
  }
});

// All students receive
socket.on('class:update', (data) => {
  console.log('Class update:', data.update);
  console.log('Updated by:', data.updatedBy.userName);
});
```

#### Leave Class Room
```javascript
socket.emit('leave:class', courseId);
```

---

### 4. ANNOUNCEMENTS

#### Join Announcement Channels
```javascript
socket.emit('join:announcements', {
  courseId: 'optional-course-id' // for course-specific announcements
});

socket.on('announcements:joined', (data) => {
  console.log('Joined channels:', data.channels);
  // ['all', 'student', 'course:courseId']
});

// Receive new announcement
socket.on('new:announcement', (announcement) => {
  console.log(announcement);
  // {
  //   _id: '...',
  //   title: 'Important Update',
  //   content: '...',
  //   priority: 'high' | 'medium' | 'low',
  //   targetAudience: 'all' | 'students' | 'faculty',
  //   createdAt: '...'
  // }
});
```

---

### 5. ATTENDANCE

#### Mark Attendance (Faculty only)
```javascript
socket.emit('attendance:mark', {
  courseId: courseId,
  attendanceData: {
    // attendance details
  }
});

socket.on('attendance:marked', (data) => {
  console.log('Attendance marked successfully');
});

// Students receive update
socket.on('attendance:updated', (data) => {
  console.log('Attendance updated by:', data.markedBy);
});
```

---

### 6. ASSIGNMENTS

#### Assignment Posted (Faculty only)
```javascript
socket.emit('assignment:posted', {
  courseId: courseId,
  assignmentData: {
    title: 'Homework 1',
    description: '...',
    dueDate: '...'
  }
});

// Students receive notification
socket.on('new:assignment', (data) => {
  console.log('New assignment:', data.assignment);
  console.log('Posted by:', data.postedBy);
});
```

#### Assignment Submitted
```javascript
socket.emit('assignment:submitted', {
  assignmentId: assignmentId,
  courseId: courseId
});

socket.on('assignment:submitted:success', (data) => {
  console.log('Assignment submitted successfully');
});
```

---

### 7. GRADES

#### Grade Published (Faculty only)
```javascript
socket.emit('grade:published', {
  studentId: studentId,
  courseId: courseId,
  gradeData: {
    grade: 'A',
    gpa: 4.0,
    percentage: 95
  }
});

// Student receives notification
socket.on('new:grade', (data) => {
  console.log('New grade published:', data.grade);
  console.log('Published by:', data.publishedBy);
});
```

---

### 8. ONLINE STATUS

#### Update Online Status
```javascript
socket.emit('status:online');

// Others receive
socket.on('user:online', (data) => {
  console.log(`${data.userName} is now online`);
});

socket.on('user:offline', (data) => {
  console.log(`${data.userName} went offline`);
});
```

---

## Helper Functions (Backend)

These functions can be imported and used in controllers/services:

```javascript
import {
  sendNotification,
  sendMessage,
  broadcastAnnouncement,
  broadcastToClass,
  getOnlineUsersCount,
  getClassParticipants,
  isUserOnline
} from '../socket/socketHandler.js';

// Send notification to user
sendNotification(userId, {
  type: 'assignment',
  title: 'New Assignment',
  content: 'Assignment details...',
  link: '/assignments/123'
});

// Send message to user
sendMessage(receiverId, {
  senderId: currentUser._id,
  message: 'Hello!',
  subject: 'Greeting'
});

// Broadcast announcement
broadcastAnnouncement(announcement, 'students', courseId);

// Broadcast to class
broadcastToClass(courseId, 'class:update', {
  message: 'Class starting soon'
});

// Check online status
const isOnline = isUserOnline(userId);
const participantCount = getClassParticipants(courseId);
```

---

## Error Handling

```javascript
// Listen for errors
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // Handle authentication errors, permission errors, etc.
});
```

Common errors:
- `Authentication token required` - No token provided
- `User not found` - Invalid token or deleted user
- `User account is deactivated` - Account disabled
- `Invalid or expired token` - Token expired or invalid
- `Only faculty can...` - Permission denied

---

## Complete Example

```javascript
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io('http://localhost:5001', {
      auth: { token }
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected');
      
      // Join all relevant rooms
      this.socket.emit('join:notifications');
      this.socket.emit('join:chat');
      this.socket.emit('join:announcements');
    });

    this.socket.on('new:notification', this.handleNotification);
    this.socket.on('new:message', this.handleMessage);
    this.socket.on('new:announcement', this.handleAnnouncement);
    this.socket.on('class:update', this.handleClassUpdate);
  }

  handleNotification(notification) {
    // Show toast notification
    console.log('New notification:', notification);
  }

  handleMessage(message) {
    // Update chat UI
    console.log('New message:', message);
  }

  handleAnnouncement(announcement) {
    // Display announcement
    console.log('New announcement:', announcement);
  }

  handleClassUpdate(update) {
    // Update class view
    console.log('Class update:', update);
  }

  joinClass(courseId) {
    this.socket.emit('join:class', courseId);
  }

  leaveClass(courseId) {
    this.socket.emit('leave:class', courseId);
  }

  sendMessage(receiverId, message) {
    this.socket.emit('message:send', { receiverId, message });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
```

---

## Testing with Socket.io Client

```bash
npm install socket.io-client

# Create test-socket.js
node test-socket.js
```

```javascript
// test-socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected');
  
  socket.emit('join:notifications');
  socket.emit('join:chat');
});

socket.on('new:notification', (data) => {
  console.log('📢 Notification:', data);
});

socket.on('new:message', (data) => {
  console.log('💬 Message:', data);
});
```
