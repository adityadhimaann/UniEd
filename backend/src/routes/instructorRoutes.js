import express from 'express';
import instructorController from '../controllers/instructorController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication and faculty/admin role
router.use(authenticate);
router.use(checkRole('faculty', 'admin'));

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-grade-fix', // Updated version to verify new code is running
    message: 'Instructor routes loaded with grade submission fixes'
  });
});

// Course routes
router.get('/courses', instructorController.getMyCourses);
router.post('/courses', instructorController.createCourse);
router.post('/courses/with-content', instructorController.createCourseWithContent);
router.put('/courses/:courseId', instructorController.updateCourse);
router.delete('/courses/:courseId', instructorController.deleteCourse);
router.get('/courses/:courseId/students', instructorController.getCourseStudents);

// Assignment routes
router.post('/assignments', instructorController.createAssignment);
router.get('/courses/:courseId/assignments', instructorController.getCourseAssignments);
router.get('/assignments/:assignmentId/submissions', instructorController.getAssignmentSubmissions);
router.put('/assignments/:assignmentId', instructorController.updateAssignment);
router.delete('/assignments/:assignmentId', instructorController.deleteAssignment);
router.post('/assignments/:assignmentId/grade/:studentId', instructorController.gradeSubmission);
router.post('/assignments/:assignmentId/review/:studentId', instructorController.reviewSubmission);

// Attendance routes
router.post('/attendance', instructorController.markAttendance);
router.get('/courses/:courseId/attendance', instructorController.getCourseAttendance);

// Announcement routes
router.post('/announcements', instructorController.createAnnouncement);
router.get('/courses/:courseId/announcements', instructorController.getCourseAnnouncements);
router.put('/announcements/:announcementId', instructorController.updateAnnouncement);
router.delete('/announcements/:announcementId', instructorController.deleteAnnouncement);

// Grade routes
router.post('/grades', instructorController.submitGrades);

// Profile and Settings routes
router.get('/profile', instructorController.getProfile);
router.put('/profile', instructorController.updateProfile);
router.put('/change-password', instructorController.changePassword);
router.put('/notification-settings', instructorController.updateNotificationSettings);
router.put('/privacy-settings', instructorController.updatePrivacySettings);
router.delete('/account', instructorController.deleteAccount);
router.get('/courses/:courseId/grades', instructorController.getCourseGrades);

// Statistics route
router.get('/statistics', instructorController.getStatistics);

// Notification routes
router.get('/notifications', instructorController.getMyNotifications);
router.patch('/notifications/:notificationId/read', instructorController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', instructorController.markAllNotificationsAsRead);

// Course content management routes
router.get('/courses/:courseId/content', instructorController.getCourseContent);
router.post('/courses/:courseId/videos', instructorController.addCourseVideo);
router.put('/courses/:courseId/videos/:videoId', instructorController.updateCourseVideo);
router.delete('/courses/:courseId/videos/:videoId', instructorController.deleteCourseVideo);
router.post('/courses/:courseId/materials', instructorController.addCourseMaterial);
router.put('/courses/:courseId/materials/:materialId', instructorController.updateCourseMaterial);
router.delete('/courses/:courseId/materials/:materialId', instructorController.deleteCourseMaterial);
router.put('/courses/:courseId/learning-outcomes', instructorController.updateLearningOutcomes);
router.put('/courses/:courseId/prerequisites', instructorController.updatePrerequisites);

export default router;
