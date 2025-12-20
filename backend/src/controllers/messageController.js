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
 * Get faculty members from student's enrolled courses
 */
export const getFacultyByCourse = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const { courseId } = req.query;

  // Only students can use this endpoint
  if (userRole !== 'student') {
    throw new ApiError(403, 'This endpoint is only available for students');
  }

  const facultyByCourse = await messageService.getFacultyByCourse(userId, courseId);

  res.status(200).json(
    new ApiResponse(200, facultyByCourse, 'Faculty fetched successfully')
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
  const { receiverId, content, fileUrl, fileType } = req.body;

  if (!receiverId || (!content?.trim() && !fileUrl)) {
    throw new ApiError(400, 'Receiver and message content or file are required');
  }

  const message = await messageService.createMessage({
    sender: senderId,
    receiver: receiverId,
    content: content?.trim() || '',
    fileUrl: fileUrl || null,
    fileType: fileType || null,
  });

  // Send real-time notification via Socket.IO to receiver
  sendMessage(receiverId, message);

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
  getFacultyByCourse,
  getUsers,
  getMessages,
  sendMessageHTTP,
  markAsRead,
  deleteConversation,
};
