import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a simple direct message
 */
export const createMessage = async (messageData) => {
  const { sender, receiver, content } = messageData;

  // Verify both users exist
  const [senderUser, receiverUser] = await Promise.all([
    User.findById(sender),
    User.findById(receiver),
  ]);

  if (!senderUser || !receiverUser) {
    throw new ApiError(404, 'User not found');
  }

  // For now, we'll use a simple in-memory structure
  // In production, you'd save to a Message collection
  const message = {
    _id: new Date().getTime().toString(),
    sender: {
      _id: senderUser._id,
      firstName: senderUser.profile?.firstName || '',
      lastName: senderUser.profile?.lastName || '',
      email: senderUser.email,
      avatar: senderUser.profile?.avatar || null,
    },
    receiver: receiverUser._id,
    content,
    isRead: false,
    createdAt: new Date(),
  };

  return message;
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (userId) => {
  // Get all users except the current user
  const users = await User.find(
    { _id: { $ne: userId } },
    'profile.firstName profile.lastName email profile.avatar role lastSeen'
  )
    .sort({ lastSeen: -1 })
    .limit(50)
    .lean();

  // Transform to conversation format
  const conversations = users.map(user => ({
    _id: user._id,
    user: {
      _id: user._id,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      email: user.email,
      avatar: user.profile?.avatar || null,
      role: user.role,
    },
    lastMessage: null,
    unreadCount: 0,
    lastMessageTime: user.lastSeen || user.createdAt,
  }));

  return conversations;
};

/**
 * Get users for starting new conversation
 */
export const getUsers = async (currentUserId, filters = {}) => {
  const query = { _id: { $ne: currentUserId } };

  // Apply search filter
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { 'profile.firstName': searchRegex },
      { 'profile.lastName': searchRegex },
      { email: searchRegex },
    ];
  }

  // Apply role filter
  if (filters.role) {
    query.role = filters.role;
  }

  const users = await User.find(query, 'profile.firstName profile.lastName email profile.avatar role')
    .limit(50)
    .lean();

  return users.map(user => ({
    _id: user._id,
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
    email: user.email,
    avatar: user.profile?.avatar || null,
    role: user.role,
  }));
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

  // In a real implementation, you'd query a Message collection
  // For now, return empty array as messages will be sent via Socket.IO
  return {
    messages: [],
    pagination: {
      page,
      limit,
      total: 0,
      hasMore: false,
    },
  };
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (userId, otherUserId) => {
  // In production, update Message collection
  // For now, this is a no-op since we're using Socket.IO
  return true;
};

/**
 * Delete conversation
 */
export const deleteConversation = async (userId, otherUserId) => {
  // In production, delete messages from Message collection
  // For now, this is a no-op
  return true;
};

export default {
  createMessage,
  getConversations,
  getUsers,
  getMessages,
  markMessagesAsRead,
  deleteConversation,
};
