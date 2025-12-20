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

  console.log('=== GRADE SUBMISSION REQUEST ===');
  console.log('Assignment ID:', assignmentId);
  console.log('Student ID:', studentId);
  console.log('Instructor ID:', instructorId);
  console.log('Grade:', grade);
  console.log('Feedback:', feedback);
  console.log('Request body:', req.body);

  if (grade === undefined || grade === null || grade === '') {
    console.error('Grade validation failed: grade is', grade);
    throw ApiError.badRequest('Grade is required');
  }

  const result = await instructorService.gradeSubmission(
    assignmentId,
    studentId,
    instructorId,
    { grade: Number(grade), feedback }
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

// ==================== COURSE CONTENT MANAGEMENT ====================

// Create course with full content
export const createCourseWithContent = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const courseData = req.body;

  const result = await instructorService.createCourseWithContent(instructorId, courseData);

  res.status(201).json(
    ApiResponse.success(result, 'Course created with content successfully')
  );
});

// Get course content
export const getCourseContent = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const content = await instructorService.getCourseContent(courseId, instructorId);

  res.status(200).json(
    ApiResponse.success(content, 'Course content retrieved successfully')
  );
});

// Add video to course
export const addCourseVideo = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const videoData = req.body;

  const course = await instructorService.addCourseVideo(courseId, instructorId, videoData);

  res.status(201).json(
    ApiResponse.success(course, 'Video added successfully')
  );
});

// Update video
export const updateCourseVideo = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.params;
  const instructorId = req.user._id;
  const videoData = req.body;

  const course = await instructorService.updateCourseVideo(courseId, instructorId, videoId, videoData);

  res.status(200).json(
    ApiResponse.success(course, 'Video updated successfully')
  );
});

// Delete video
export const deleteCourseVideo = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.params;
  const instructorId = req.user._id;

  const course = await instructorService.deleteCourseVideo(courseId, instructorId, videoId);

  res.status(200).json(
    ApiResponse.success(course, 'Video deleted successfully')
  );
});

// Add material to course
export const addCourseMaterial = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const materialData = req.body;

  const course = await instructorService.addCourseMaterial(courseId, instructorId, materialData);

  res.status(201).json(
    ApiResponse.success(course, 'Material added successfully')
  );
});

// Update material
export const updateCourseMaterial = asyncHandler(async (req, res) => {
  const { courseId, materialId } = req.params;
  const instructorId = req.user._id;
  const materialData = req.body;

  const course = await instructorService.updateCourseMaterial(courseId, instructorId, materialId, materialData);

  res.status(200).json(
    ApiResponse.success(course, 'Material updated successfully')
  );
});

// Delete material
export const deleteCourseMaterial = asyncHandler(async (req, res) => {
  const { courseId, materialId } = req.params;
  const instructorId = req.user._id;

  const course = await instructorService.deleteCourseMaterial(courseId, instructorId, materialId);

  res.status(200).json(
    ApiResponse.success(course, 'Material deleted successfully')
  );
});

// Update learning outcomes
export const updateLearningOutcomes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const { outcomes } = req.body;

  const course = await instructorService.updateLearningOutcomes(courseId, instructorId, outcomes);

  res.status(200).json(
    ApiResponse.success(course, 'Learning outcomes updated successfully')
  );
});

// Update prerequisites
export const updatePrerequisites = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;
  const { prerequisites } = req.body;

  const course = await instructorService.updatePrerequisites(courseId, instructorId, prerequisites);

  res.status(200).json(
    ApiResponse.success(course, 'Prerequisites updated successfully')
  );
});

// Profile and Settings Controllers
const getProfile = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    success: true,
    data: user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const { firstName, lastName, phone, department, designation, bio, officeLocation, officeHours, specialization } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update profile fields
  if (!user.profile) {
    user.profile = {};
  }
  
  if (firstName) user.profile.firstName = firstName;
  if (lastName) user.profile.lastName = lastName;
  if (phone) user.profile.phone = phone;
  if (department) user.profile.department = department;
  if (designation) user.profile.designation = designation;
  if (bio) user.profile.bio = bio;
  if (officeLocation) user.profile.officeLocation = officeLocation;
  if (officeHours) user.profile.officeHours = officeHours;
  if (specialization) user.profile.specialization = specialization;
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new password' });
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

const updateNotificationSettings = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const { emailNotifications, assignmentSubmissions, enrollmentRequests, announcements, systemUpdates } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!user.settings) {
    user.settings = {};
  }
  
  if (!user.settings.notifications) {
    user.settings.notifications = {};
  }
  
  user.settings.notifications = {
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    assignmentSubmissions: assignmentSubmissions !== undefined ? assignmentSubmissions : true,
    enrollmentRequests: enrollmentRequests !== undefined ? enrollmentRequests : true,
    announcements: announcements !== undefined ? announcements : true,
    systemUpdates: systemUpdates !== undefined ? systemUpdates : false
  };
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: user.settings.notifications
  });
});

const updatePrivacySettings = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const { showEmail, showPhone, showOfficeHours } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!user.settings) {
    user.settings = {};
  }
  
  if (!user.settings.privacy) {
    user.settings.privacy = {};
  }
  
  user.settings.privacy = {
    showEmail: showEmail !== undefined ? showEmail : false,
    showPhone: showPhone !== undefined ? showPhone : false,
    showOfficeHours: showOfficeHours !== undefined ? showOfficeHours : true
  };
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Privacy settings updated successfully',
    data: user.settings.privacy
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const Course = (await import('../models/Course.js')).default;
  const Assignment = (await import('../models/Assignment.js')).default;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if user has active courses
  const activeCourses = await Course.countDocuments({ faculty: req.user.id });
  
  if (activeCourses > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete account with active courses. Please transfer or delete your courses first.' 
    });
  }
  
  // Delete user
  await User.findByIdAndDelete(req.user.id);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
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
  createCourseWithContent,
  getCourseContent,
  addCourseVideo,
  updateCourseVideo,
  deleteCourseVideo,
  addCourseMaterial,
  updateCourseMaterial,
  deleteCourseMaterial,
  updateLearningOutcomes,
  updatePrerequisites,
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationSettings,
  updatePrivacySettings,
  deleteAccount
};
