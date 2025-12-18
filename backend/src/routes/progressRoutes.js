import express from 'express';
import progressController from '../controllers/progressController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all progress for a student
router.get('/', progressController.getAllStudentProgress);

// Get student progress for a course
router.get('/course/:courseId', progressController.getStudentProgress);

// Update module progress (students)
router.post(
  '/course/:courseId/module',
  checkRole(['student']),
  progressController.updateModuleProgress
);

// Update material progress (students)
router.post(
  '/course/:courseId/material',
  checkRole(['student']),
  progressController.updateMaterialProgress
);

// Add time spent (students)
router.post(
  '/course/:courseId/time',
  checkRole(['student']),
  progressController.addTimeSpent
);

// Issue certificate (faculty/admin)
router.post(
  '/course/:courseId/certificate',
  checkRole(['faculty', 'admin']),
  progressController.issueCertificate
);

// Get course progress statistics (faculty/admin)
router.get(
  '/course/:courseId/statistics',
  checkRole(['faculty', 'admin']),
  progressController.getCourseProgressStatistics
);

export default router;
