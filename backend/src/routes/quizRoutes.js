import express from 'express';
import quizController from '../controllers/quizController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create quiz (faculty only)
router.post(
  '/',
  checkRole(['faculty', 'admin']),
  quizController.createQuiz
);

// Get course quizzes
router.get('/course/:courseId', quizController.getCourseQuizzes);

// Get quiz by ID
router.get('/:quizId', quizController.getQuizById);

// Update quiz (faculty only)
router.put(
  '/:quizId',
  checkRole(['faculty', 'admin']),
  quizController.updateQuiz
);

// Delete quiz (faculty only)
router.delete(
  '/:quizId',
  checkRole(['faculty', 'admin']),
  quizController.deleteQuiz
);

// Start quiz attempt (students)
router.post(
  '/:quizId/attempt',
  checkRole(['student']),
  quizController.startQuizAttempt
);

// Submit quiz attempt (students)
router.post(
  '/:quizId/attempt/:attemptId/submit',
  checkRole(['student']),
  quizController.submitQuizAttempt
);

// Get quiz statistics (faculty only)
router.get(
  '/:quizId/statistics',
  checkRole(['faculty', 'admin']),
  quizController.getQuizStatistics
);

export default router;
