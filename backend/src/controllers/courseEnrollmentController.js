import CourseEnrollmentRequest from '../models/CourseEnrollmentRequest.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Create a new course enrollment request
 * @route   POST /api/v1/course-enrollment-requests
 * @access  Private (Student)
 */
export const createEnrollmentRequest = asyncHandler(async (req, res) => {
  const { courseId, enrollmentType, message } = req.body;
  const studentId = req.user._id;

  // Validate course exists
  const course = await Course.findById(courseId).populate('faculty');
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Check if student already has a pending request for this course
  const existingRequest = await CourseEnrollmentRequest.findOne({
    student: studentId,
    course: courseId,
    status: 'pending'
  });

  if (existingRequest) {
    throw new ApiError(400, 'You already have a pending enrollment request for this course');
  }

  // Create enrollment request
  const enrollmentRequest = await CourseEnrollmentRequest.create({
    student: studentId,
    course: courseId,
    instructor: course.faculty._id,
    enrollmentType,
    message,
    status: 'pending'
  });

  // Populate the request with student details
  await enrollmentRequest.populate('student', 'firstName lastName email avatar');

  // Create notification for instructor
  await Notification.create({
    user: course.faculty._id,
    type: 'enrollment-request',
    title: 'New Enrollment Request',
    message: `${req.user.firstName} ${req.user.lastName} has requested to enroll in ${course.courseName}`,
    metadata: {
      enrollmentRequestId: enrollmentRequest._id,
      courseId: course._id,
      courseName: course.courseName,
      studentId: studentId,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      enrollmentType
    }
  });

  // Create confirmation notification for student
  await Notification.create({
    user: studentId,
    type: 'enrollment-request',
    title: 'Enrollment Request Submitted',
    message: `Your enrollment request for ${course.courseName} has been submitted to ${course.faculty.firstName} ${course.faculty.lastName}`,
    metadata: {
      enrollmentRequestId: enrollmentRequest._id,
      courseId: course._id,
      courseName: course.courseName,
      instructorName: `${course.faculty.firstName} ${course.faculty.lastName}`,
      enrollmentType
    }
  });

  res.status(201).json(
    new ApiResponse(201, enrollmentRequest, 'Enrollment request submitted successfully')
  );
});

/**
 * @desc    Get all enrollment requests (for instructors)
 * @route   GET /api/v1/course-enrollment-requests
 * @access  Private (Instructor)
 */
export const getEnrollmentRequests = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const { status, courseId } = req.query;

  const filter = { instructor: instructorId };
  
  if (status) {
    filter.status = status;
  }
  
  if (courseId) {
    filter.course = courseId;
  }

  const enrollmentRequests = await CourseEnrollmentRequest.find(filter)
    .populate('student', 'firstName lastName email avatar')
    .populate('course', 'courseName courseCode')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, enrollmentRequests, 'Enrollment requests retrieved successfully')
  );
});

/**
 * @desc    Get student's own enrollment requests
 * @route   GET /api/v1/course-enrollment-requests/my-requests
 * @access  Private (Student)
 */
export const getMyEnrollmentRequests = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const enrollmentRequests = await CourseEnrollmentRequest.find({ student: studentId })
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, enrollmentRequests, 'Your enrollment requests retrieved successfully')
  );
});

/**
 * @desc    Respond to an enrollment request (approve/reject)
 * @route   PATCH /api/v1/course-enrollment-requests/:id
 * @access  Private (Instructor)
 */
export const respondToEnrollmentRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, responseMessage } = req.body; // status: 'approved' or 'rejected'
  const instructorId = req.user._id;

  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Status must be either approved or rejected');
  }

  // Find the enrollment request
  const enrollmentRequest = await CourseEnrollmentRequest.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('course', 'courseName courseCode');

  if (!enrollmentRequest) {
    throw new ApiError(404, 'Enrollment request not found');
  }

  // Verify instructor owns this request
  if (enrollmentRequest.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to respond to this request');
  }

  // Check if already responded
  if (enrollmentRequest.status !== 'pending') {
    throw new ApiError(400, 'This enrollment request has already been responded to');
  }

  // Update the request
  enrollmentRequest.status = status;
  enrollmentRequest.respondedAt = new Date();
  enrollmentRequest.respondedBy = instructorId;
  if (responseMessage) {
    enrollmentRequest.message = `${enrollmentRequest.message}\n\nInstructor Response: ${responseMessage}`;
  }
  await enrollmentRequest.save();

  // If approved, create an enrollment record
  if (status === 'approved') {
    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: enrollmentRequest.student._id,
      course: enrollmentRequest.course._id
    });

    if (!existingEnrollment) {
      await Enrollment.create({
        student: enrollmentRequest.student._id,
        course: enrollmentRequest.course._id,
        enrollmentDate: new Date(),
        status: 'active'
      });
    }
  }

  // Create notification for student
  const notificationMessage = status === 'approved' 
    ? `Your enrollment request for ${enrollmentRequest.course.courseName} has been approved! ${responseMessage || ''}`
    : `Your enrollment request for ${enrollmentRequest.course.courseName} has been rejected. ${responseMessage || ''}`;

  await Notification.create({
    user: enrollmentRequest.student._id,
    type: 'enrollment-response',
    title: status === 'approved' ? 'Enrollment Approved' : 'Enrollment Rejected',
    message: notificationMessage,
    metadata: {
      enrollmentRequestId: enrollmentRequest._id,
      courseId: enrollmentRequest.course._id,
      courseName: enrollmentRequest.course.courseName,
      status,
      instructorName: `${req.user.firstName} ${req.user.lastName}`
    }
  });

  res.status(200).json(
    new ApiResponse(200, enrollmentRequest, `Enrollment request ${status} successfully`)
  );
});

/**
 * @desc    Get single enrollment request details
 * @route   GET /api/v1/course-enrollment-requests/:id
 * @access  Private
 */
export const getEnrollmentRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const enrollmentRequest = await CourseEnrollmentRequest.findById(id)
    .populate('student', 'firstName lastName email avatar')
    .populate('course', 'courseName courseCode description')
    .populate('instructor', 'firstName lastName email');

  if (!enrollmentRequest) {
    throw new ApiError(404, 'Enrollment request not found');
  }

  // Check if user is authorized to view this request
  const isStudent = enrollmentRequest.student._id.toString() === userId.toString();
  const isInstructor = enrollmentRequest.instructor._id.toString() === userId.toString();

  if (!isStudent && !isInstructor) {
    throw new ApiError(403, 'You are not authorized to view this enrollment request');
  }

  res.status(200).json(
    new ApiResponse(200, enrollmentRequest, 'Enrollment request retrieved successfully')
  );
});
