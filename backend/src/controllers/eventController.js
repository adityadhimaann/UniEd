import Event from '../models/Event.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import VirtualClass from '../models/VirtualClass.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Get all events for the authenticated user
 * @route   GET /api/v1/events
 * @access  Private
 */
export const getMyEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const { startDate, endDate, type, courseId } = req.query;

  let events = [];
  const filter = {};

  // Date range filter
  if (startDate && endDate) {
    filter.startDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Type filter
  if (type) {
    filter.type = type;
  }

  // Course filter
  if (courseId) {
    filter.course = courseId;
  }

  if (userRole === 'student') {
    // Get enrolled courses
    const enrollments = await Enrollment.find({ 
      student: userId, 
      status: 'active' 
    }).select('course');
    const courseIds = enrollments.map(e => e.course);

    // Get events for enrolled courses or created by user
    events = await Event.find({
      ...filter,
      $or: [
        { course: { $in: courseIds } },
        { createdBy: userId },
        { participants: userId },
      ],
    })
      .populate('course', 'courseName courseCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 });

    // Add assignments as deadline events
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      dueDate: filter.startDate || { $gte: new Date() },
    })
      .populate('course', 'courseName courseCode')
      .sort({ dueDate: 1 });

    const assignmentEvents = assignments.map(assignment => ({
      _id: `assignment-${assignment._id}`,
      title: assignment.title,
      description: assignment.description,
      type: 'deadline',
      startDate: assignment.dueDate,
      startTime: '11:59 PM',
      course: assignment.course,
      createdBy: assignment.createdBy,
      isAllDay: false,
      color: '#ef4444',
      source: 'assignment',
      sourceId: assignment._id,
    }));

    // Add virtual classes as lecture events
    const virtualClasses = await VirtualClass.find({
      course: { $in: courseIds },
      scheduledStartTime: filter.startDate || { $gte: new Date() },
    })
      .populate('course', 'courseName courseCode')
      .populate('host', 'firstName lastName')
      .sort({ scheduledStartTime: 1 });

    const virtualClassEvents = virtualClasses.map(vc => ({
      _id: `virtual-class-${vc._id}`,
      title: vc.title,
      description: vc.description,
      type: 'virtual-class',
      startDate: vc.scheduledStartTime,
      endDate: vc.scheduledEndTime,
      startTime: new Date(vc.scheduledStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      endTime: new Date(vc.scheduledEndTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      course: vc.course,
      createdBy: vc.host,
      isAllDay: false,
      color: '#10b981',
      source: 'virtual-class',
      sourceId: vc._id,
    }));

    events = [...events, ...assignmentEvents, ...virtualClassEvents];
  } else if (userRole === 'faculty') {
    // Get courses taught by faculty
    const Course = (await import('../models/Course.js')).default;
    const courses = await Course.find({ faculty: userId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // Get events for courses taught or created by faculty
    events = await Event.find({
      ...filter,
      $or: [
        { course: { $in: courseIds } },
        { createdBy: userId },
      ],
    })
      .populate('course', 'courseName courseCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 });

    // Add virtual classes
    const virtualClasses = await VirtualClass.find({
      host: userId,
      scheduledStartTime: filter.startDate || { $gte: new Date() },
    })
      .populate('course', 'courseName courseCode')
      .sort({ scheduledStartTime: 1 });

    const virtualClassEvents = virtualClasses.map(vc => ({
      _id: `virtual-class-${vc._id}`,
      title: vc.title,
      description: vc.description,
      type: 'virtual-class',
      startDate: vc.scheduledStartTime,
      endDate: vc.scheduledEndTime,
      startTime: new Date(vc.scheduledStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      endTime: new Date(vc.scheduledEndTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      course: vc.course,
      createdBy: { _id: userId, firstName: req.user.firstName, lastName: req.user.lastName },
      isAllDay: false,
      color: '#10b981',
      source: 'virtual-class',
      sourceId: vc._id,
    }));

    events = [...events, ...virtualClassEvents];
  }

  // Sort all events by start date
  events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  res.status(200).json(
    new ApiResponse(200, events, 'Events retrieved successfully')
  );
});

/**
 * @desc    Create a new event
 * @route   POST /api/v1/events
 * @access  Private (Faculty/Admin)
 */
export const createEvent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const eventData = req.body;

  const event = await Event.create({
    ...eventData,
    createdBy: userId,
  });

  await event.populate('course', 'courseName courseCode');
  await event.populate('createdBy', 'firstName lastName');

  res.status(201).json(
    new ApiResponse(201, event, 'Event created successfully')
  );
});

/**
 * @desc    Get event by ID
 * @route   GET /api/v1/events/:id
 * @access  Private
 */
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate('course', 'courseName courseCode')
    .populate('createdBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  res.status(200).json(
    new ApiResponse(200, event, 'Event retrieved successfully')
  );
});

/**
 * @desc    Update event
 * @route   PATCH /api/v1/events/:id
 * @access  Private (Creator/Admin)
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if user is creator or admin
  if (event.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this event');
  }

  Object.assign(event, updates);
  await event.save();

  await event.populate('course', 'courseName courseCode');
  await event.populate('createdBy', 'firstName lastName');

  res.status(200).json(
    new ApiResponse(200, event, 'Event updated successfully')
  );
});

/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Creator/Admin)
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if user is creator or admin
  if (event.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this event');
  }

  await event.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Event deleted successfully')
  );
});

/**
 * @desc    Get events for a specific course
 * @route   GET /api/v1/events/course/:courseId
 * @access  Private
 */
export const getCourseEvents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const events = await Event.find({ course: courseId })
    .populate('createdBy', 'firstName lastName')
    .sort({ startDate: 1 });

  res.status(200).json(
    new ApiResponse(200, events, 'Course events retrieved successfully')
  );
});
