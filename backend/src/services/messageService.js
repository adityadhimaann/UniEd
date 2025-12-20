import User from '../models/User.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create and save a message
 */
export const createMessage = async (messageData) => {
  const { sender, receiver, content, fileUrl, fileType } = messageData;

  // Verify both users exist
  const [senderUser, receiverUser] = await Promise.all([
    User.findById(sender),
    User.findById(receiver),
  ]);

  if (!senderUser || !receiverUser) {
    throw new ApiError(404, 'User not found');
  }

  // Create and save message
  const message = await Message.create({
    sender,
    receiver,
    content: content?.trim() || '',
    fileUrl: fileUrl || null,
    fileType: fileType || null,
    isRead: false,
  });

  // Populate sender details
  await message.populate('sender', 'firstName lastName email avatar role');

  return {
    _id: message._id,
    sender: {
      _id: message.sender._id,
      firstName: message.sender.firstName || '',
      lastName: message.sender.lastName || '',
      name: `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || message.sender.email.split('@')[0],
      email: message.sender.email,
      avatar: message.sender.avatar || null,
    },
    receiver: message.receiver,
    content: message.content,
    fileUrl: message.fileUrl,
    fileType: message.fileType,
    isRead: message.isRead,
    createdAt: message.createdAt,
  };
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (userId) => {
  // Get current user to check their role
  const currentUser = await User.findById(userId, 'role').lean();
  if (!currentUser) {
    throw new ApiError(404, 'User not found');
  }

  // Build query based on user role
  const query = { _id: { $ne: userId } };
  
  // If user is a student, only show faculty members from their enrolled courses
  if (currentUser.role === 'student') {
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const Course = (await import('../models/Course.js')).default;
    
    const enrollments = await Enrollment.find({ student: userId })
      .populate('course', 'faculty')
      .lean();
    
    const facultyIds = [...new Set(
      enrollments
        .map(e => e.course?.faculty)
        .filter(Boolean)
    )];
    
    if (facultyIds.length === 0) {
      return [];
    }
    
    query._id = { $in: facultyIds };
  }
  // If user is faculty, show all students from their courses
  else if (currentUser.role === 'faculty') {
    const Course = (await import('../models/Course.js')).default;
    const Enrollment = (await import('../models/Enrollment.js')).default;
    
    const courses = await Course.find({ faculty: userId }, '_id').lean();
    const courseIds = courses.map(c => c._id);
    
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .distinct('student');
    
    query._id = { $in: enrollments };
  }

  // Get all users based on query
  const users = await User.find(
    query,
    'firstName lastName email avatar role lastSeen'
  ).lean();

  // Get last message for each user
  const conversations = await Promise.all(
    users.map(async (user) => {
      // Find last message between current user and this user
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: user._id },
          { sender: user._id, receiver: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      // Count unread messages from this user
      const unreadCount = await Message.countDocuments({
        sender: user._id,
        receiver: userId,
        isRead: false
      });

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      return {
        _id: user._id,
        user: {
          _id: user._id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          name: fullName || user.email.split('@')[0],
          email: user.email,
          avatar: user.avatar || null,
          role: user.role,
        },
        lastMessage: lastMessage?.content || null,
        unreadCount,
        lastMessageTime: lastMessage?.createdAt || user.lastSeen || user.createdAt,
      };
    })
  );

  // Sort by last message time
  conversations.sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  return conversations;
};

/**
 * Get faculty members from student's enrolled courses
 */
export const getFacultyByCourse = async (studentId, courseId = null) => {
  const Enrollment = (await import('../models/Enrollment.js')).default;
  const Course = (await import('../models/Course.js')).default;
  
  // Build query for enrollments
  const enrollmentQuery = { student: studentId };
  if (courseId) {
    enrollmentQuery.course = courseId;
  }
  
  // Get enrolled courses with faculty details
  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate({
      path: 'course',
      select: 'courseName courseCode faculty',
      populate: {
        path: 'faculty',
        select: 'firstName lastName email avatar role department'
      }
    })
    .lean();
  
  // Group faculty by course
  const facultyByCourse = enrollments
    .filter(e => e.course && e.course.faculty)
    .map(e => {
      const faculty = e.course.faculty;
      const fullName = `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim();
      
      return {
        courseId: e.course._id,
        courseName: e.course.courseName,
        courseCode: e.course.courseCode,
        faculty: {
          _id: faculty._id,
          firstName: faculty.firstName || '',
          lastName: faculty.lastName || '',
          name: fullName || faculty.email.split('@')[0],
          email: faculty.email,
          avatar: faculty.avatar || null,
          role: faculty.role,
          department: faculty.department,
        }
      };
    });
  
  return facultyByCourse;
};

/**
 * Get users for starting new conversation
 */
export const getUsers = async (currentUserId, filters = {}) => {
  // Get current user to check their role
  const currentUser = await User.findById(currentUserId, 'role').lean();
  if (!currentUser) {
    throw new ApiError(404, 'User not found');
  }

  const query = { _id: { $ne: currentUserId } };

  // If user is a student, only show faculty members
  if (currentUser.role === 'student') {
    query.role = 'faculty';
  }

  // Apply search filter
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  // Apply role filter (only if not a student, or if it's faculty)
  if (filters.role && (currentUser.role !== 'student' || filters.role === 'faculty')) {
    query.role = filters.role;
  }

  const users = await User.find(query, 'firstName lastName email avatar role')
    .limit(50)
    .lean();

  return users.map(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return {
      _id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: fullName || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar || null,
      role: user.role,
    };
  });
};

/**
 * Get messages between two users
 */
export const getMessages = async (userId, otherUserId, page = 1, limit = 50) => {
  // Verify other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new ApiError(404, 'User not found');
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Get messages between the two users
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId }
    ]
  })
    .sort({ createdAt: 1 }) // Oldest first
    .skip(skip)
    .limit(limit)
    .populate('sender', 'firstName lastName email avatar')
    .lean();

  // Get total count for pagination
  const total = await Message.countDocuments({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId }
    ]
  });

  // Transform messages
  const transformedMessages = messages.map(msg => {
    const fullName = `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim();
    return {
      _id: msg._id,
      sender: {
        _id: msg.sender._id,
        firstName: msg.sender.firstName || '',
        lastName: msg.sender.lastName || '',
        name: fullName || msg.sender.email.split('@')[0],
        email: msg.sender.email,
        avatar: msg.sender.avatar || null,
      },
      content: msg.content,
      fileUrl: msg.fileUrl,
      fileType: msg.fileType,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    };
  });

  return {
    messages: transformedMessages,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + messages.length < total,
    },
  };
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (userId, otherUserId) => {
  // Mark all unread messages from otherUser to userId as read
  const result = await Message.updateMany(
    {
      sender: otherUserId,
      receiver: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );

  return result.modifiedCount;
};

/**
 * Delete conversation
 */
export const deleteConversation = async (userId, otherUserId) => {
  // Delete all messages between the two users
  const result = await Message.deleteMany({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId }
    ]
  });

  return result.deletedCount;
};

export default {
  createMessage,
  getConversations,
  getFacultyByCourse,
  getUsers,
  getMessages,
  markMessagesAsRead,
  deleteConversation,
};
