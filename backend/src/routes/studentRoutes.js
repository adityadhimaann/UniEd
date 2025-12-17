import express from 'express';
import studentController from '../controllers/studentController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication and student role
router.use(authenticate);
router.use(checkRole('student'));

// Dashboard & Statistics
router.get('/dashboard', studentController.getDashboard);

// Courses
router.get('/courses', studentController.getMyCourses);
router.get('/courses/:courseId', studentController.getCourseDetails);

// Assignments
router.get('/assignments', studentController.getMyAssignments);
router.get('/assignments/:assignmentId', studentController.getAssignmentDetails);
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

// Grades
router.get('/grades', studentController.getMyGrades);
router.get('/courses/:courseId/grades', studentController.getCourseGrades);

// Attendance
router.get('/attendance', studentController.getMyAttendance);
router.get('/courses/:courseId/attendance', studentController.getCourseAttendance);

// Announcements
router.get('/announcements', studentController.getMyAnnouncements);
router.get('/courses/:courseId/announcements', studentController.getCourseAnnouncements);

// Notifications
router.get('/notifications', studentController.getMyNotifications);
router.patch('/notifications/:notificationId/read', studentController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', studentController.markAllNotificationsAsRead);

export default router;
