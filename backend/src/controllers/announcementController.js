import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import emailService from '../services/emailService.js';

/**
 * @desc    Create a new announcement
 * @route   POST /api/v1/announcements
 * @access  Private (Faculty/Admin)
 */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority, targetAudience, courseId, expiresAt, attachments } = req.body;
  const createdBy = req.user._id;

  // Create announcement
  const announcement = await Announcement.create({
    title,
    content,
    priority: priority || 'medium',
    targetAudience: targetAudience || 'all',
    course: courseId || null,
    expiresAt: expiresAt || null,
    attachments: attachments || [],
    createdBy,
  });

  // Populate creator and course
  await announcement.populate('createdBy', 'firstName lastName email');
  if (courseId) {
    await announcement.populate('course', 'courseName courseCode');
  }

  // Determine who should receive notifications
  let recipients = [];

  if (courseId) {
    // Course-specific announcement - notify enrolled students
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('student', '_id email firstName lastName');
    
    recipients = enrollments.map(e => e.student);
  } else {
    // General announcement - notify based on target audience
    const filter = {};
    if (targetAudience === 'students') {
      filter.role = 'student';
    } else if (targetAudience === 'faculty') {
      filter.role = 'faculty';
    }
    // If 'all', no filter needed
    
    recipients = await User.find(filter).select('_id email firstName lastName');
  }

  // Create notifications for recipients
  const notificationPromises = recipients.map(recipient =>
    Notification.create({
      user: recipient._id,
      type: 'announcement',
      title: `New Announcement: ${title}`,
      content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      link: `/dashboard/announcements`,
    })
  );

  await Promise.all(notificationPromises);

  // Send emails (async, don't wait)
  recipients.forEach(recipient => {
    emailService.sendAnnouncementEmail(recipient, announcement).catch(err => {
      console.error('Failed to send announcement email to', recipient.email, err);
    });
  });

  res.status(201).json(
    new ApiResponse(201, announcement, 'Announcement created successfully')
  );
});

/**
 * @desc    Get all announcements
 * @route   GET /api/v1/announcements
 * @access  Private
 */
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { courseId, priority, targetAudience, includeExpired } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  const filter = {};

  // Filter by course if specified
  if (courseId) {
    filter.course = courseId;
  }

  // Filter by priority if specified
  if (priority) {
    filter.priority = priority;
  }

  // Filter by target audience based on user role
  if (userRole === 'student') {
    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'students' }
    ];
  } else if (userRole === 'faculty') {
    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'faculty' },
      { createdBy: userId } // Faculty can see their own announcements
    ];
  }

  // Filter by target audience if specified (for admin)
  if (targetAudience && userRole === 'admin') {
    filter.targetAudience = targetAudience;
  }

  // Exclude expired announcements unless requested
  if (includeExpired !== 'true') {
    filter.$or = [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('course', 'courseName courseCode')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, announcements, 'Announcements retrieved successfully')
  );
});

/**
 * @desc    Get single announcement by ID
 * @route   GET /api/v1/announcements/:id
 * @access  Private
 */
export const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id)
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('course', 'courseName courseCode');

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json(
    new ApiResponse(200, announcement, 'Announcement retrieved successfully')
  );
});

/**
 * @desc    Update announcement
 * @route   PATCH /api/v1/announcements/:id
 * @access  Private (Faculty/Admin - Creator only)
 */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, priority, targetAudience, expiresAt, attachments } = req.body;
  const userId = req.user._id;

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  // Check if user is the creator or admin
  if (announcement.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this announcement');
  }

  // Update fields
  if (title) announcement.title = title;
  if (content) announcement.content = content;
  if (priority) announcement.priority = priority;
  if (targetAudience) announcement.targetAudience = targetAudience;
  if (expiresAt !== undefined) announcement.expiresAt = expiresAt;
  if (attachments) announcement.attachments = attachments;

  await announcement.save();

  await announcement.populate('createdBy', 'firstName lastName email avatar');
  await announcement.populate('course', 'courseName courseCode');

  res.status(200).json(
    new ApiResponse(200, announcement, 'Announcement updated successfully')
  );
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/v1/announcements/:id
 * @access  Private (Faculty/Admin - Creator only)
 */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  // Check if user is the creator or admin
  if (announcement.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this announcement');
  }

  await announcement.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Announcement deleted successfully')
  );
});

/**
 * @desc    Get announcements for a specific course
 * @route   GET /api/v1/announcements/course/:courseId
 * @access  Private
 */
export const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const announcements = await Announcement.find({
    course: courseId,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
    .populate('createdBy', 'firstName lastName email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, announcements, 'Course announcements retrieved successfully')
  );
});
