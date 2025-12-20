import asyncHandler from '../utils/asyncHandler.js';
import instructorService from '../services/instructorService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// Get all courses taught by instructor
export const getMyCourses = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const courses = await instructorService.getInstructorCourses(instructorId);

  res.status(200).json(
    ApiResponse.success(courses, 'Courses retrieved successfully')
  );
});

// Create a new course
export const createCourse = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const courseData = req.body;

  console.log('Creating course with data:', courseData);
  console.log('Instructor ID:', instructorId);

  const course = await instructorService.createCourse(instructorId, courseData);

  res.status(201).json(
    ApiResponse.success(course, 'Course created successfully')
  );
});

// Update course
export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const updates = req.body;

  const course = await instructorService.updateCourse(courseId, instructorId, updates);

  res.status(200).json(
    ApiResponse.success(course, 'Course updated successfully')
  );
});

// Delete course
export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  await instructorService.deleteCourse(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(null, 'Course deleted successfully')
  );
});

// Get students enrolled in a course
export const getCourseStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const students = await instructorService.getCourseStudents(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(students, 'Students retrieved successfully')
  );
});

// Create assignment
export const createAssignment = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const assignmentData = req.body;

  console.log('=== CREATE ASSIGNMENT DEBUG ===');
  console.log('Instructor ID:', instructorId);
  console.log('Request body:', JSON.stringify(assignmentData, null, 2));
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);

  const assignment = await instructorService.createAssignment(instructorId, assignmentData);

  res.status(201).json(
    ApiResponse.success(assignment, 'Assignment created successfully')
  );
});

// Get course assignments
export const getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const assignments = await instructorService.getCourseAssignments(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(assignments, 'Assignments retrieved successfully')
  );
});

// Update assignment
export const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const instructorId = req.user._id;
  const updates = req.body;

  const assignment = await instructorService.updateAssignment(assignmentId, instructorId, updates);

  res.status(200).json(
    ApiResponse.success(assignment, 'Assignment updated successfully')
  );
});

// Delete assignment
export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const instructorId = req.user._id;

  await instructorService.deleteAssignment(assignmentId, instructorId);

  res.status(200).json(
    ApiResponse.success(null, 'Assignment deleted successfully')
  );
});

// Get assignment submissions
export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const instructorId = req.user._id;

  const result = await instructorService.getAssignmentSubmissions(assignmentId, instructorId);

  res.status(200).json(
    ApiResponse.success(result, 'Submissions retrieved successfully')
  );
});

// Grade assignment submission
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const instructorId = req.user._id;
  const { grade, feedback } = req.body;

  if (grade === undefined) {
    throw ApiError.badRequest('Grade is required');
  }

  const result = await instructorService.gradeSubmission(
    assignmentId,
    studentId,
    instructorId,
    { grade, feedback }
  );

  res.status(200).json(
    ApiResponse.success(result, 'Submission graded successfully')
  );
});

// Review assignment submission (approve/disapprove/viewed)
export const reviewSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const instructorId = req.user._id;
  const { reviewStatus, feedback } = req.body;

  if (!reviewStatus || !['viewed', 'approved', 'disapproved'].includes(reviewStatus)) {
    throw ApiError.badRequest('Valid review status is required (viewed, approved, or disapproved)');
  }

  const result = await instructorService.reviewSubmission(
    assignmentId,
    studentId,
    instructorId,
    { reviewStatus, feedback }
  );

  res.status(200).json(
    ApiResponse.success(result, `Submission ${reviewStatus} successfully`)
  );
});

// Mark attendance
export const markAttendance = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const { courseId, date, attendanceRecords } = req.body;

  if (!courseId || !date || !attendanceRecords) {
    throw ApiError.badRequest('Course ID, date, and attendance records are required');
  }

  const attendance = await instructorService.markAttendance(
    instructorId,
    courseId,
    date,
    attendanceRecords
  );

  res.status(201).json(
    ApiResponse.success(attendance, 'Attendance marked successfully')
  );
});

// Get course attendance
export const getCourseAttendance = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const { startDate, endDate } = req.query;

  const attendance = await instructorService.getCourseAttendance(
    courseId,
    instructorId,
    startDate,
    endDate
  );

  res.status(200).json(
    ApiResponse.success(attendance, 'Attendance retrieved successfully')
  );
});

// Create announcement
export const createAnnouncement = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const announcementData = req.body;

  const announcement = await instructorService.createAnnouncement(instructorId, announcementData);

  res.status(201).json(
    ApiResponse.success(announcement, 'Announcement created successfully')
  );
});

// Get course announcements
export const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const announcements = await instructorService.getCourseAnnouncements(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(announcements, 'Announcements retrieved successfully')
  );
});

// Update announcement
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const instructorId = req.user._id;
  const updates = req.body;

  const announcement = await instructorService.updateAnnouncement(announcementId, instructorId, updates);

  res.status(200).json(
    ApiResponse.success(announcement, 'Announcement updated successfully')
  );
});

// Delete announcement
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const instructorId = req.user._id;

  await instructorService.deleteAnnouncement(announcementId, instructorId);

  res.status(200).json(
    ApiResponse.success(null, 'Announcement deleted successfully')
  );
});

// Get instructor statistics
export const getStatistics = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const statistics = await instructorService.getInstructorStatistics(instructorId);

  res.status(200).json(
    ApiResponse.success(statistics, 'Statistics retrieved successfully')
  );
});

// Submit grades for a course
export const submitGrades = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const { grades } = req.body;

  if (!grades || !Array.isArray(grades)) {
    throw ApiError.badRequest('Grades array is required');
  }

  const result = await instructorService.submitGrades(courseId, instructorId, grades);

  res.status(200).json(
    ApiResponse.success(result, 'Grades submitted successfully')
  );
});

// Get course grades
export const getCourseGrades = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const grades = await instructorService.getCourseGrades(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(grades, 'Grades retrieved successfully')
  );
});

// Get instructor notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const { limit = 20, skip = 0 } = req.query;

  const notifications = await instructorService.getNotifications(instructorId, { 
    limit: parseInt(limit), 
    skip: parseInt(skip) 
  });

  res.status(200).json(
    ApiResponse.success(notifications, 'Notifications retrieved successfully')
  );
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const instructorId = req.user._id;

  const notification = await instructorService.markNotificationAsRead(notificationId, instructorId);

  res.status(200).json(
    ApiResponse.success(notification, 'Notification marked as read')
  );
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const result = await instructorService.markAllNotificationsAsRead(instructorId);

  res.status(200).json(
    ApiResponse.success(result, 'All notifications marked as read')
  );
});

export default {
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  createAssignment,
  getCourseAssignments,
  getAssignmentSubmissions,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
  reviewSubmission,
  markAttendance,
  getCourseAttendance,
  createAnnouncement,
  getCourseAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getStatistics,
  submitGrades,
  getCourseGrades,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
