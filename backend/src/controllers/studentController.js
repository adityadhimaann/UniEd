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

// Get all available courses created by faculty
const getAvailableCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courses = await studentService.getAvailableCourses(studentId);

  res.status(200).json(
    ApiResponse.success(courses, 'Available courses retrieved successfully')
  );
});

// Get course suggestions for student
const getCourseSuggestions = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const suggestions = await studentService.getCourseSuggestions(studentId);

  res.status(200).json(
    ApiResponse.success(suggestions, 'Course suggestions retrieved successfully')
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

// Get public course details (no authentication required)
export const getPublicCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const courseDetails = await studentService.getPublicCourseDetails(courseId);

  res.status(200).json(
    ApiResponse.success(courseDetails, 'Course details retrieved successfully')
  );
});

// Get enrolled course details with full content (requires authentication)
export const getEnrolledCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const courseDetails = await studentService.getEnrolledCourseDetails(courseId, studentId);

  res.status(200).json(
    ApiResponse.success(courseDetails, 'Course details retrieved successfully')
  );
});

// ==================== CONTENT PROGRESS TRACKING ====================

// Mark video as watched
export const markVideoWatched = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.params;
  const studentId = req.user._id;

  const progress = await studentService.markVideoWatched(studentId, courseId, videoId);

  res.status(200).json(
    ApiResponse.success(progress, 'Video marked as watched')
  );
});

// Mark material as viewed
export const markMaterialViewed = asyncHandler(async (req, res) => {
  const { courseId, materialId } = req.params;
  const studentId = req.user._id;

  const progress = await studentService.markMaterialViewed(studentId, courseId, materialId);

  res.status(200).json(
    ApiResponse.success(progress, 'Material marked as viewed')
  );
});

// Get content progress
export const getContentProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const progress = await studentService.getContentProgress(studentId, courseId);

  res.status(200).json(
    ApiResponse.success(progress, 'Content progress retrieved successfully')
  );
});

// Get enrolled courses with progress
export const getEnrolledCoursesWithProgress = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const courses = await studentService.getEnrolledCoursesWithProgress(studentId);

  res.status(200).json(
    ApiResponse.success(courses, 'Enrolled courses with progress retrieved successfully')
  );
});

export default {
  getDashboard,
  getMyCourses,
  getAvailableCourses,
  getCourseSuggestions,
  getCourseDetails,
  getPublicCourseDetails,
  getEnrolledCourseDetails,
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
  // Content progress
  markVideoWatched,
  markMaterialViewed,
  getContentProgress,
  getEnrolledCoursesWithProgress,
};
