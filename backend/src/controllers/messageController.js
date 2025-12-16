import messageService from '../services/messageService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { sendMessage } from '../socket/socketHandler.js';

/**
 * Get all conversations for the current user
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await messageService.getConversations(userId);

  res.status(200).json(
    new ApiResponse(200, conversations, 'Conversations fetched successfully')
  );
});

/**
 * Get all users (for starting new conversation)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { search, role } = req.query;
  
  const users = await messageService.getUsers(userId, { search, role });

  res.status(200).json(
    new ApiResponse(200, users, 'Users fetched successfully')
  );
});

/**
 * Get messages between current user and another user
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const messages = await messageService.getMessages(
    userId, 
    otherUserId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json(
    new ApiResponse(200, messages, 'Messages fetched successfully')
  );
});

/**
 * Send a message
 */
export const sendMessageHTTP = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, content } = req.body;

  if (!receiverId || !content?.trim()) {
    throw new ApiError(400, 'Receiver and message content are required');
  }

  const message = await messageService.createMessage({
    sender: senderId,
    receiver: receiverId,
    content: content.trim(),
  });

  // Send real-time notification via Socket.IO
  sendMessage(receiverId, {
    _id: message._id,
    sender: {
      _id: message.sender._id,
      firstName: message.sender.firstName,
      lastName: message.sender.lastName,
      email: message.sender.email,
      avatar: message.sender.avatar,
    },
    content: message.content,
    createdAt: message.createdAt,
  });

  res.status(201).json(
    new ApiResponse(201, message, 'Message sent successfully')
  );
});

/**
 * Mark messages as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;

  await messageService.markMessagesAsRead(userId, otherUserId);

  res.status(200).json(
    new ApiResponse(200, null, 'Messages marked as read')
  );
});

/**
 * Delete a conversation
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;

  await messageService.deleteConversation(userId, otherUserId);

  res.status(200).json(
    new ApiResponse(200, null, 'Conversation deleted successfully')
  );
});

export default {
  getConversations,
  getUsers,
  getMessages,
  sendMessageHTTP,
  markAsRead,
  deleteConversation,
};
