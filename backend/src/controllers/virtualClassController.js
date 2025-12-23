import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import virtualClassService from '../services/virtualClassService.js';
import Enrollment from '../models/Enrollment.js';
import VirtualClass from '../models/VirtualClass.js';

// Get my virtual classes (all enrolled courses)
export const getMyVirtualClasses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let virtualClasses = [];

  if (userRole === 'student') {
    // Get all courses the student is enrolled in
    const enrollments = await Enrollment.find({ 
      student: userId, 
      status: 'active' 
    }).select('course');
    
    const courseIds = enrollments.map(e => e.course);
    
    // Get all virtual classes for these courses
    virtualClasses = await VirtualClass.find({
      course: { $in: courseIds }
    })
      .populate('course', 'courseName courseCode')
      .populate('host', 'firstName lastName email')
      .sort({ scheduledStartTime: -1 });
  } else if (userRole === 'faculty') {
    // Get all virtual classes hosted by this faculty
    virtualClasses = await VirtualClass.find({
      host: userId
    })
      .populate('course', 'courseName courseCode')
      .populate('host', 'firstName lastName email')
      .sort({ scheduledStartTime: -1 });
  }

  res.status(200).json(
    ApiResponse.success(virtualClasses, 'Virtual classes retrieved successfully')
  );
});

// Create virtual class
export const createVirtualClass = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const classData = req.body;

  const virtualClass = await virtualClassService.createVirtualClass(hostId, classData);

  res.status(201).json(
    ApiResponse.success(virtualClass, 'Virtual class created successfully')
  );
});

// Get course virtual classes
export const getCourseVirtualClasses = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const virtualClasses = await virtualClassService.getCourseVirtualClasses(courseId, userId, userRole);

  res.status(200).json(
    ApiResponse.success(virtualClasses, 'Virtual classes retrieved successfully')
  );
});

// Get virtual class by ID
export const getVirtualClassById = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;

  const virtualClass = await virtualClassService.getVirtualClassById(classId, userId);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Virtual class retrieved successfully')
  );
});

// Start virtual class
export const startVirtualClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const hostId = req.user._id;

  const virtualClass = await virtualClassService.startVirtualClass(classId, hostId);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Virtual class started successfully')
  );
});

// End virtual class
export const endVirtualClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const hostId = req.user._id;

  const virtualClass = await virtualClassService.endVirtualClass(classId, hostId);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Virtual class ended successfully')
  );
});

// Join virtual class
export const joinVirtualClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;
  const { role } = req.body;

  const virtualClass = await virtualClassService.joinVirtualClass(classId, userId, role);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Joined virtual class successfully')
  );
});

// Leave virtual class
export const leaveVirtualClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;

  const virtualClass = await virtualClassService.leaveVirtualClass(classId, userId);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Left virtual class successfully')
  );
});

// Send chat message
export const sendChatMessage = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;
  const { message, isPrivate, recipientId } = req.body;

  const virtualClass = await virtualClassService.sendChatMessage(classId, userId, message, isPrivate, recipientId);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Message sent successfully')
  );
});

// Create poll
export const createPoll = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const hostId = req.user._id;
  const pollData = req.body;

  const virtualClass = await virtualClassService.createPoll(classId, hostId, pollData);

  res.status(201).json(
    ApiResponse.success(virtualClass, 'Poll created successfully')
  );
});

// Vote on poll
export const voteOnPoll = asyncHandler(async (req, res) => {
  const { classId, pollId } = req.params;
  const userId = req.user._id;
  const { optionIndex } = req.body;

  const virtualClass = await virtualClassService.voteOnPoll(classId, userId, pollId, optionIndex);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Vote recorded successfully')
  );
});

// Update whiteboard
export const updateWhiteboard = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;
  const { whiteboardData } = req.body;

  const virtualClass = await virtualClassService.updateWhiteboard(classId, userId, whiteboardData);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Whiteboard updated successfully')
  );
});

// Share file
export const shareFile = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const userId = req.user._id;
  const fileData = req.body;

  const virtualClass = await virtualClassService.shareFile(classId, userId, fileData);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'File shared successfully')
  );
});

// Toggle participant setting
export const toggleParticipantSetting = asyncHandler(async (req, res) => {
  const { classId, participantId } = req.params;
  const hostId = req.user._id;
  const { setting, value } = req.body;

  const virtualClass = await virtualClassService.toggleParticipantSetting(classId, hostId, participantId, setting, value);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Participant setting updated successfully')
  );
});

// Update class settings
export const updateClassSettings = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const hostId = req.user._id;
  const settings = req.body;

  const virtualClass = await virtualClassService.updateClassSettings(classId, hostId, settings);

  res.status(200).json(
    ApiResponse.success(virtualClass, 'Class settings updated successfully')
  );
});

// Delete virtual class
export const deleteVirtualClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const hostId = req.user._id;

  const result = await virtualClassService.deleteVirtualClass(classId, hostId);

  res.status(200).json(
    ApiResponse.success(result, 'Virtual class deleted successfully')
  );
});

export default {
  getMyVirtualClasses,
  createVirtualClass,
  getCourseVirtualClasses,
  getVirtualClassById,
  startVirtualClass,
  endVirtualClass,
  joinVirtualClass,
  leaveVirtualClass,
  sendChatMessage,
  createPoll,
  voteOnPoll,
  updateWhiteboard,
  shareFile,
  toggleParticipantSetting,
  updateClassSettings,
  deleteVirtualClass,
};
