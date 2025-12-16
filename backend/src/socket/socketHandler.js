import { Server } from 'socket.io';
import socketAuth from './socketAuth.js';

let io = null;

// User room mappings
const userSockets = new Map(); // userId -> Set of socketIds
const classRooms = new Map();  // classId -> Set of socketIds

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`✅ Socket connected: ${socket.id} (User: ${socket.user.email})`);

    // Store user socket mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    // Join user's notification room
    socket.on('join:notifications', (data) => {
      const room = `notifications:${userId}`;
      socket.join(room);
      console.log(`📢 User ${userId} joined notifications room`);
      
      socket.emit('notifications:joined', {
        success: true,
        message: 'Joined notifications room',
        room,
      });
    });

    // Leave notification room
    socket.on('leave:notifications', () => {
      const room = `notifications:${userId}`;
      socket.leave(room);
      console.log(`📢 User ${userId} left notifications room`);
    });

    // Mark notification as read
    socket.on('notification:read', (notificationId) => {
      console.log(`✓ Notification ${notificationId} marked as read by ${userId}`);
      // TODO: Update notification in database
      socket.emit('notification:read:success', { notificationId });
    });

    // ==========================================
    // MESSAGES / CHAT
    // ==========================================

    // Join user's chat room
    socket.on('join:chat', (data) => {
      const room = `chat:${userId}`;
      socket.join(room);
      console.log(`💬 User ${userId} joined chat room`);
      
      socket.emit('chat:joined', {
        success: true,
        message: 'Joined chat room',
        room,
      });
    });

    // Leave chat room
    socket.on('leave:chat', () => {
      const room = `chat:${userId}`;
      socket.leave(room);
      console.log(`💬 User ${userId} left chat room`);
    });

    // Send message (emits to receiver)
    socket.on('message:send', (data) => {
      const { receiverId, message } = data;
      console.log(`💬 Message from ${userId} to ${receiverId}`);
      
      // Emit to receiver's chat room
      io.to(`chat:${receiverId}`).emit('new:message', {
        _id: `${Date.now()}-${userId}`,
        sender: {
          _id: socket.user._id,
          firstName: socket.user.profile?.firstName || '',
          lastName: socket.user.profile?.lastName || '',
          email: socket.user.email,
          avatar: socket.user.profile?.avatar || null,
        },
        content: message,
        createdAt: new Date().toISOString(),
      });

      // Confirm to sender
      socket.emit('message:sent', {
        success: true,
        receiverId,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('typing:start', (receiverId) => {
      io.to(`chat:${receiverId}`).emit('user:typing', {
        userId,
        userName: socket.user.getFullName(),
      });
    });

    socket.on('typing:stop', (receiverId) => {
      io.to(`chat:${receiverId}`).emit('user:typing:stop', {
        userId,
      });
    });

    // Mark message as read
    socket.on('message:read', (messageId) => {
      console.log(`✓ Message ${messageId} marked as read by ${userId}`);
      // TODO: Update message in database and notify sender
      socket.emit('message:read:success', { messageId });
    });

    // ==========================================
    // LIVE CLASS / COURSE
    // ==========================================

    // Join a class/course room
    socket.on('join:class', (classId) => {
      const room = `class:${classId}`;
      socket.join(room);
      
      // Track class participants
      if (!classRooms.has(classId)) {
        classRooms.set(classId, new Set());
      }
      classRooms.get(classId).add(socket.id);

      const participantCount = classRooms.get(classId).size;
      
      console.log(`🎓 User ${userId} joined class ${classId} (${participantCount} participants)`);

      // Notify user
      socket.emit('class:joined', {
        success: true,
        classId,
        room,
        participantCount,
      });

      // Notify others in the class
      socket.to(room).emit('class:participant:joined', {
        userId,
        userName: socket.user.getFullName(),
        userRole: socket.user.role,
        participantCount,
      });
    });

    // Leave class room
    socket.on('leave:class', (classId) => {
      const room = `class:${classId}`;
      socket.leave(room);

      if (classRooms.has(classId)) {
        classRooms.get(classId).delete(socket.id);
        const participantCount = classRooms.get(classId).size;

        console.log(`🎓 User ${userId} left class ${classId} (${participantCount} participants)`);

        // Notify others
        socket.to(room).emit('class:participant:left', {
          userId,
          userName: socket.user.getFullName(),
          participantCount,
        });
      }
    });

    // Class update (for faculty)
    socket.on('class:update', (data) => {
      const { classId, update } = data;
      
      // Only faculty can send class updates
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can send class updates' });
        return;
      }

      console.log(`🎓 Class update for ${classId} by ${userId}`);

      io.to(`class:${classId}`).emit('class:update', {
        classId,
        update,
        updatedBy: {
          userId,
          userName: socket.user.getFullName(),
        },
        timestamp: new Date(),
      });
    });

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================

    // Join announcement channel
    socket.on('join:announcements', (data) => {
      const { courseId } = data || {};
      
      // Join general announcements
      socket.join('announcements:all');

      // Join role-specific announcements
      socket.join(`announcements:${socket.user.role}`);

      // Join course-specific announcements if courseId provided
      if (courseId) {
        socket.join(`announcements:course:${courseId}`);
      }

      console.log(`📢 User ${userId} joined announcement channels`);

      socket.emit('announcements:joined', {
        success: true,
        channels: ['all', socket.user.role, courseId ? `course:${courseId}` : null].filter(Boolean),
      });
    });

    // ==========================================
    // ATTENDANCE
    // ==========================================

    // Faculty marks attendance
    socket.on('attendance:mark', (data) => {
      const { courseId, attendanceData } = data;

      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can mark attendance' });
        return;
      }

      console.log(`✓ Attendance marked for course ${courseId} by ${userId}`);

      // Notify students in the class
      io.to(`class:${courseId}`).emit('attendance:updated', {
        courseId,
        markedBy: socket.user.getFullName(),
        timestamp: new Date(),
      });

      socket.emit('attendance:marked', {
        success: true,
        courseId,
      });
    });

    // ==========================================
    // ASSIGNMENTS
    // ==========================================

    // New assignment posted
    socket.on('assignment:posted', (data) => {
      const { courseId, assignmentData } = data;

      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can post assignments' });
        return;
      }

      console.log(`📝 New assignment posted for course ${courseId}`);

      // Notify enrolled students
      io.to(`class:${courseId}`).emit('new:assignment', {
        courseId,
        assignment: assignmentData,
        postedBy: socket.user.getFullName(),
        timestamp: new Date(),
      });
    });

    // Assignment submitted
    socket.on('assignment:submitted', (data) => {
      const { assignmentId, courseId } = data;

      console.log(`📝 Assignment ${assignmentId} submitted by ${userId}`);

      socket.emit('assignment:submitted:success', {
        success: true,
        assignmentId,
      });
    });

    // ==========================================
    // GRADES
    // ==========================================

    // Grade published
    socket.on('grade:published', (data) => {
      const { studentId, courseId, gradeData } = data;

      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can publish grades' });
        return;
      }

      console.log(`📊 Grade published for student ${studentId} in course ${courseId}`);

      // Notify specific student
      io.to(`notifications:${studentId}`).emit('new:grade', {
        courseId,
        grade: gradeData,
        publishedBy: socket.user.getFullName(),
        timestamp: new Date(),
      });
    });

    // ==========================================
    // ONLINE STATUS
    // ==========================================

    // Update online status
    socket.on('status:online', () => {
      socket.broadcast.emit('user:online', {
        userId,
        userName: socket.user.getFullName(),
      });
    });

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id} (User: ${socket.user.email})`);

      // Remove from user sockets
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          
          // Notify others user went offline
          socket.broadcast.emit('user:offline', {
            userId,
            userName: socket.user.getFullName(),
          });
        }
      }

      // Remove from all class rooms
      classRooms.forEach((sockets, classId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          const participantCount = sockets.size;
          
          io.to(`class:${classId}`).emit('class:participant:left', {
            userId,
            userName: socket.user.getFullName(),
            participantCount,
          });
        }
      });
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

// Helper function to get socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper functions to emit events from controllers/services

// Send notification to specific user
export const sendNotification = (userId, notification) => {
  if (!io) return;
  
  io.to(`notifications:${userId}`).emit('new:notification', {
    ...notification,
    timestamp: new Date(),
  });
};

// Send message to specific user
export const sendMessage = (receiverId, messageData) => {
  if (!io) return;
  
  io.to(`chat:${receiverId}`).emit('new:message', {
    ...messageData,
    timestamp: new Date(),
  });
};

// Broadcast announcement
export const broadcastAnnouncement = (announcement, targetAudience = 'all', courseId = null) => {
  if (!io) return;

  if (courseId) {
    io.to(`announcements:course:${courseId}`).emit('new:announcement', announcement);
  } else if (targetAudience === 'all') {
    io.to('announcements:all').emit('new:announcement', announcement);
  } else {
    io.to(`announcements:${targetAudience}`).emit('new:announcement', announcement);
  }
};

// Broadcast to class
export const broadcastToClass = (classId, event, data) => {
  if (!io) return;
  
  io.to(`class:${classId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};

// Get online users count
export const getOnlineUsersCount = () => {
  return userSockets.size;
};

// Get class participants count
export const getClassParticipants = (classId) => {
  return classRooms.get(classId)?.size || 0;
};

// Check if user is online
export const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

export default { initializeSocket, getIO, sendNotification, sendMessage, broadcastAnnouncement };
