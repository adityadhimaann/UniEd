import asyncHandler from '../utils/asyncHandler.js';
import studentService from '../services/studentService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// Get student dashboard data
const getDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const dashboard = await studentService.getDashboardData(studentId);

  res.status(200).json(
    ApiResponse.success(dashboard, 'Dashboard data retrieved successfully')
  );
});

// Get student's enrolled courses
const getMyCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courses = await studentService.getEnrolledCourses(studentId);

  res.status(200).json(
    ApiResponse.success(courses, 'Courses retrieved successfully')
  );
});

// Get course details
const getCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const course = await studentService.getCourseDetails(courseId, studentId);

  res.status(200).json(
    ApiResponse.success(course, 'Course details retrieved successfully')
  );
});

// Get all assignments for student
const getMyAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const assignments = await studentService.getStudentAssignments(studentId);

  res.status(200).json(
    ApiResponse.success(assignments, 'Assignments retrieved successfully')
  );
});

// Get assignment details
const getAssignmentDetails = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const studentId = req.user._id;

  const assignment = await studentService.getAssignmentDetails(assignmentId, studentId);

  res.status(200).json(
    ApiResponse.success(assignment, 'Assignment details retrieved successfully')
  );
});

// Submit assignment
const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const studentId = req.user._id;
  const submissionData = req.body;

  const submission = await studentService.submitAssignment(assignmentId, studentId, submissionData);

  res.status(200).json(
    ApiResponse.success(submission, 'Assignment submitted successfully')
  );
});

// Get all grades
const getMyGrades = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const grades = await studentService.getStudentGrades(studentId);

  res.status(200).json(
    ApiResponse.success(grades, 'Grades retrieved successfully')
  );
});

// Get course grades
const getCourseGrades = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const grades = await studentService.getCourseGrades(courseId, studentId);

  res.status(200).json(
    ApiResponse.success(grades, 'Course grades retrieved successfully')
  );
});

// Get attendance records
const getMyAttendance = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const attendance = await studentService.getStudentAttendance(studentId);

  res.status(200).json(
    ApiResponse.success(attendance, 'Attendance retrieved successfully')
  );
});

// Get course attendance
const getCourseAttendance = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const attendance = await studentService.getCourseAttendance(courseId, studentId);

  res.status(200).json(
    ApiResponse.success(attendance, 'Course attendance retrieved successfully')
  );
});

// Get announcements
const getMyAnnouncements = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const announcements = await studentService.getStudentAnnouncements(studentId);

  res.status(200).json(
    ApiResponse.success(announcements, 'Announcements retrieved successfully')
  );
});

// Get course announcements
const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const announcements = await studentService.getCourseAnnouncements(courseId, studentId);

  res.status(200).json(
    ApiResponse.success(announcements, 'Course announcements retrieved successfully')
  );
});

// Get student notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { limit = 20, skip = 0 } = req.query;

  const notifications = await studentService.getNotifications(studentId, { limit: parseInt(limit), skip: parseInt(skip) });

  res.status(200).json(
    ApiResponse.success(notifications, 'Notifications retrieved successfully')
  );
});

// Mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const studentId = req.user._id;

  const notification = await studentService.markNotificationAsRead(notificationId, studentId);

  res.status(200).json(
    ApiResponse.success(notification, 'Notification marked as read')
  );
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const result = await studentService.markAllNotificationsAsRead(studentId);

  res.status(200).json(
    ApiResponse.success(result, 'All notifications marked as read')
  );
});

export default {
  getDashboard,
  getMyCourses,
  getCourseDetails,
  getMyAssignments,
  getAssignmentDetails,
  submitAssignment,
  getMyGrades,
  getCourseGrades,
  getMyAttendance,
  getCourseAttendance,
  getMyAnnouncements,
  getCourseAnnouncements,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
