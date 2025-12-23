import { Server } from 'socket.io';
import socketAuth from './socketAuth.js';

let io = null;

// User room mappings
const userSockets = new Map(); // userId -> Set of socketIds
const classRooms = new Map();  // classId -> Set of socketIds
const virtualClassRooms = new Map(); // virtualClassId -> Map of userId -> participant data

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

    // Helper function to get user's full name safely
    const getUserName = () => {
      const firstName = socket.user.profile?.firstName || socket.user.firstName || 'User';
      const lastName = socket.user.profile?.lastName || socket.user.lastName || '';
      return `${firstName} ${lastName}`.trim();
    };

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
    // VIRTUAL CLASSROOM
    // ==========================================

    // Join virtual classroom
    socket.on('virtualClass:join', async (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      socket.join(room);
      
      // Initialize room if doesn't exist
      if (!virtualClassRooms.has(classId)) {
        virtualClassRooms.set(classId, new Map());
      }
      
      // Add participant to room
      const participant = {
        userId,
        socketId: socket.id,
        userName: getUserName(),
        userRole: socket.user.role,
        avatar: socket.user.profile?.avatar || null,
        isMuted: false,
        isVideoOff: false,
        isHandRaised: false,
        joinedAt: new Date(),
      };
      
      virtualClassRooms.get(classId).set(userId, participant);
      
      const participants = Array.from(virtualClassRooms.get(classId).values());
      
      console.log(`🎥 User ${getUserName()} joined virtual class ${classId} (${participants.length} participants)`);
      
      // Notify user
      socket.emit('virtualClass:joined', {
        success: true,
        classId,
        participants,
      });
      
      // Notify others
      socket.to(room).emit('virtualClass:participant:joined', {
        participant,
        totalParticipants: participants.length,
      });
    });

    // Leave virtual classroom
    socket.on('virtualClass:leave', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      socket.leave(room);
      
      if (virtualClassRooms.has(classId)) {
        const participant = virtualClassRooms.get(classId).get(userId);
        virtualClassRooms.get(classId).delete(userId);
        const participants = Array.from(virtualClassRooms.get(classId).values());
        
        console.log(`🎥 User ${getUserName()} left virtual class ${classId} (${participants.length} participants)`);
        
        // Notify others
        socket.to(room).emit('virtualClass:participant:left', {
          userId,
          userName: getUserName(),
          totalParticipants: participants.length,
        });
      }
    });

    // Toggle audio (mute/unmute)
    socket.on('virtualClass:toggleAudio', (data) => {
      const { classId, isMuted } = data;
      const room = `virtualClass:${classId}`;
      
      if (virtualClassRooms.has(classId) && virtualClassRooms.get(classId).has(userId)) {
        virtualClassRooms.get(classId).get(userId).isMuted = isMuted;
        
        console.log(`🎤 User ${userId} ${isMuted ? 'muted' : 'unmuted'} in class ${classId}`);
        
        // Notify others
        socket.to(room).emit('virtualClass:participant:audioToggled', {
          userId,
          isMuted,
        });
        
        socket.emit('virtualClass:audioToggled', { success: true, isMuted });
      }
    });

    // Toggle video
    socket.on('virtualClass:toggleVideo', (data) => {
      const { classId, isVideoOff } = data;
      const room = `virtualClass:${classId}`;
      
      if (virtualClassRooms.has(classId) && virtualClassRooms.get(classId).has(userId)) {
        virtualClassRooms.get(classId).get(userId).isVideoOff = isVideoOff;
        
        console.log(`📹 User ${userId} ${isVideoOff ? 'turned off' : 'turned on'} video in class ${classId}`);
        
        // Notify others
        socket.to(room).emit('virtualClass:participant:videoToggled', {
          userId,
          isVideoOff,
        });
        
        socket.emit('virtualClass:videoToggled', { success: true, isVideoOff });
      }
    });

    // Raise/lower hand
    socket.on('virtualClass:toggleHand', (data) => {
      const { classId, isHandRaised } = data;
      const room = `virtualClass:${classId}`;
      
      if (virtualClassRooms.has(classId) && virtualClassRooms.get(classId).has(userId)) {
        virtualClassRooms.get(classId).get(userId).isHandRaised = isHandRaised;
        
        console.log(`✋ User ${userId} ${isHandRaised ? 'raised' : 'lowered'} hand in class ${classId}`);
        
        // Notify everyone
        io.to(room).emit('virtualClass:participant:handToggled', {
          userId,
          userName: getUserName(),
          isHandRaised,
        });
        
        socket.emit('virtualClass:handToggled', { success: true, isHandRaised });
      }
    });

    // Screen share start
    socket.on('virtualClass:screenShare:start', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      console.log(`🖥️ User ${userId} started screen sharing in class ${classId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:screenShare:started', {
        userId,
        userName: getUserName(),
      });
      
      socket.emit('virtualClass:screenShare:started:success', { success: true });
    });

    // Screen share stop
    socket.on('virtualClass:screenShare:stop', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      console.log(`🖥️ User ${userId} stopped screen sharing in class ${classId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:screenShare:stopped', {
        userId,
        userName: getUserName(),
      });
      
      socket.emit('virtualClass:screenShare:stopped:success', { success: true });
    });

    // Chat message in virtual class
    socket.on('virtualClass:chat:send', (data) => {
      const { classId, message, isPrivate, recipientId } = data;
      const room = `virtualClass:${classId}`;
      
      const chatMessage = {
        _id: `${Date.now()}-${userId}`,
        sender: {
          _id: userId,
          firstName: socket.user.profile?.firstName || '',
          lastName: socket.user.profile?.lastName || '',
          avatar: socket.user.profile?.avatar || null,
        },
        message,
        timestamp: new Date().toISOString(),
        isPrivate: isPrivate || false,
      };
      
      console.log(`💬 Chat message in virtual class ${classId} from ${userId}`);
      
      if (isPrivate && recipientId) {
        // Send to specific recipient
        io.to(`virtualClass:${classId}`).emit('virtualClass:chat:message', chatMessage);
        socket.emit('virtualClass:chat:sent', { success: true, message: chatMessage });
      } else {
        // Broadcast to everyone in the class
        io.to(room).emit('virtualClass:chat:message', chatMessage);
        socket.emit('virtualClass:chat:sent', { success: true, message: chatMessage });
      }
    });

    // Poll created
    socket.on('virtualClass:poll:created', (data) => {
      const { classId, poll } = data;
      const room = `virtualClass:${classId}`;
      
      // Only host/faculty can create polls
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can create polls' });
        return;
      }
      
      console.log(`📊 Poll created in virtual class ${classId} by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:poll:new', {
        poll,
        createdBy: getUserName(),
      });
    });

    // Poll vote
    socket.on('virtualClass:poll:vote', (data) => {
      const { classId, pollId, optionIndex } = data;
      const room = `virtualClass:${classId}`;
      
      console.log(`📊 Vote cast in poll ${pollId} by ${userId}`);
      
      // Notify everyone of updated poll results
      io.to(room).emit('virtualClass:poll:voted', {
        pollId,
        optionIndex,
        voterId: userId,
      });
      
      socket.emit('virtualClass:poll:vote:success', { success: true, pollId });
    });

    // Whiteboard update
    socket.on('virtualClass:whiteboard:update', (data) => {
      const { classId, whiteboardData } = data;
      const room = `virtualClass:${classId}`;
      
      console.log(`🎨 Whiteboard updated in virtual class ${classId} by ${userId}`);
      
      // Broadcast to others (not sender)
      socket.to(room).emit('virtualClass:whiteboard:updated', {
        whiteboardData,
        updatedBy: userId,
      });
    });

    // Speaking status (audio level detection)
    socket.on('virtualClass:speaking', (data) => {
      const { classId, userId: speakingUserId, isSpeaking } = data;
      const room = `virtualClass:${classId}`;
      
      // Broadcast to others (not sender)
      socket.to(room).emit('virtualClass:speaking', {
        userId: speakingUserId,
        isSpeaking,
      });
    });

    // File shared
    socket.on('virtualClass:file:shared', (data) => {
      const { classId, file } = data;
      const room = `virtualClass:${classId}`;
      
      console.log(`📎 File shared in virtual class ${classId} by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:file:new', {
        file,
        sharedBy: {
          userId,
          userName: getUserName(),
        },
      });
    });

    // Class started (by host)
    socket.on('virtualClass:started', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can start class' });
        return;
      }
      
      console.log(`🎥 Virtual class ${classId} started by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:started', {
        classId,
        startedBy: getUserName(),
        startTime: new Date(),
      });
    });

    // Class ended (by host)
    socket.on('virtualClass:ended', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can end class' });
        return;
      }
      
      console.log(`🎥 Virtual class ${classId} ended by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:ended', {
        classId,
        endedBy: getUserName(),
        endTime: new Date(),
      });
      
      // Clean up room
      if (virtualClassRooms.has(classId)) {
        virtualClassRooms.delete(classId);
      }
    });

    // Class paused (by host)
    socket.on('virtualClass:paused', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can pause class' });
        return;
      }
      
      console.log(`⏸️ Virtual class ${classId} paused by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:paused', {
        classId,
        pausedBy: getUserName(),
        pausedAt: new Date(),
      });
    });

    // Class resumed (by host)
    socket.on('virtualClass:resumed', (data) => {
      const { classId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can resume class' });
        return;
      }
      
      console.log(`▶️ Virtual class ${classId} resumed by ${userId}`);
      
      // Notify everyone
      io.to(room).emit('virtualClass:resumed', {
        classId,
        resumedBy: getUserName(),
        resumedAt: new Date(),
      });
    });

    // Participant kicked (by host)
    socket.on('virtualClass:participant:kick', (data) => {
      const { classId, participantId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can kick participants' });
        return;
      }
      
      console.log(`🚫 Participant ${participantId} kicked from virtual class ${classId}`);
      
      // Remove from room
      if (virtualClassRooms.has(classId)) {
        virtualClassRooms.get(classId).delete(participantId);
      }
      
      // Notify the kicked participant
      const participantSockets = userSockets.get(participantId);
      if (participantSockets) {
        participantSockets.forEach(socketId => {
          io.to(socketId).emit('virtualClass:kicked', {
            classId,
            reason: 'Removed by host',
          });
        });
      }
      
      // Notify others
      socket.to(room).emit('virtualClass:participant:removed', {
        participantId,
        removedBy: getUserName(),
      });
    });

    // Mute participant (by host)
    socket.on('virtualClass:participant:mute', (data) => {
      const { classId, participantId } = data;
      const room = `virtualClass:${classId}`;
      
      if (socket.user.role !== 'faculty' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Only faculty can mute participants' });
        return;
      }
      
      console.log(`🔇 Participant ${participantId} muted in virtual class ${classId}`);
      
      // Update participant state
      if (virtualClassRooms.has(classId) && virtualClassRooms.get(classId).has(participantId)) {
        virtualClassRooms.get(classId).get(participantId).isMuted = true;
      }
      
      // Notify the participant
      const participantSockets = userSockets.get(participantId);
      if (participantSockets) {
        participantSockets.forEach(socketId => {
          io.to(socketId).emit('virtualClass:muted:byHost', {
            classId,
            mutedBy: getUserName(),
          });
        });
      }
      
      // Notify others
      socket.to(room).emit('virtualClass:participant:audioToggled', {
        userId: participantId,
        isMuted: true,
      });
    });

    // WebRTC signaling for peer-to-peer connections
    socket.on('virtualClass:webrtc:offer', (data) => {
      const { classId, targetUserId, offer } = data;
      
      console.log(`🔄 WebRTC offer from ${userId} to ${targetUserId}`);
      
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('virtualClass:webrtc:offer', {
            fromUserId: userId,
            offer,
          });
        });
      }
    });

    socket.on('virtualClass:webrtc:answer', (data) => {
      const { classId, targetUserId, answer } = data;
      
      console.log(`🔄 WebRTC answer from ${userId} to ${targetUserId}`);
      
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('virtualClass:webrtc:answer', {
            fromUserId: userId,
            answer,
          });
        });
      }
    });

    socket.on('virtualClass:webrtc:iceCandidate', (data) => {
      const { classId, targetUserId, candidate } = data;
      
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('virtualClass:webrtc:iceCandidate', {
            fromUserId: userId,
            candidate,
          });
        });
      }
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

      // Remove from all virtual class rooms
      virtualClassRooms.forEach((participants, classId) => {
        if (participants.has(userId)) {
          participants.delete(userId);
          const room = `virtualClass:${classId}`;
          
          io.to(room).emit('virtualClass:participant:left', {
            userId,
            userName: socket.user.getFullName(),
            totalParticipants: participants.size,
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

// Virtual classroom helpers
export const getVirtualClassParticipants = (classId) => {
  return virtualClassRooms.get(classId)?.size || 0;
};

export const broadcastToVirtualClass = (classId, event, data) => {
  if (!io) return;
  
  io.to(`virtualClass:${classId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};

export const notifyVirtualClassParticipant = (userId, event, data) => {
  if (!io || !userSockets.has(userId)) return;
  
  const sockets = userSockets.get(userId);
  sockets.forEach(socketId => {
    io.to(socketId).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  });
};

export default { initializeSocket, getIO, sendNotification, sendMessage, broadcastAnnouncement };
