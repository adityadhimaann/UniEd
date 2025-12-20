import express from 'express';
import studentController from '../controllers/studentController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/courses/:courseId', studentController.getPublicCourseDetails);

// All routes below require authentication and student role
router.use(authenticate);
router.use(checkRole('student'));

// Dashboard & Statistics
router.get('/dashboard', studentController.getDashboard);

// Courses
router.get('/courses', studentController.getMyCourses);
router.get('/available-courses', studentController.getAvailableCourses);
router.get('/course-suggestions', studentController.getCourseSuggestions);
router.get('/courses/:courseId', studentController.getCourseDetails);
router.get('/courses/:courseId/enrolled', studentController.getEnrolledCourseDetails);

// Assignments
router.get('/assignments', studentController.getMyAssignments);
router.get('/assignments/:assignmentId', studentController.getAssignmentDetails);
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

// Grades
router.get('/grades', studentController.getMyGrades);
router.get('/grades/detailed', studentController.getDetailedGrades);
router.get('/grades/semester', studentController.getSemesterGrades);
router.get('/courses/:courseId/grades', studentController.getCourseGrades);
router.get('/courses/:courseId/grade-breakdown', studentController.getCourseGradeBreakdown);

// Calendar & Events
router.get('/upcoming-events', studentController.getUpcomingEvents);
router.get('/calendar', studentController.getMonthlyCalendar);

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

// Content progress tracking
router.get('/courses-with-progress', studentController.getEnrolledCoursesWithProgress);
router.get('/courses/:courseId/content-progress', studentController.getContentProgress);
router.post('/courses/:courseId/videos/:videoId/watch', studentController.markVideoWatched);
router.post('/courses/:courseId/materials/:materialId/view', studentController.markMaterialViewed);

export default router;
