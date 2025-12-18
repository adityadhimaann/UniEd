import express from 'express';
import liveSessionController from '../controllers/liveSessionController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create live session (faculty only)
router.post(
  '/',
  checkRole(['faculty', 'admin']),
  liveSessionController.createLiveSession
);

// Get course sessions
router.get('/course/:courseId', liveSessionController.getCourseSessions);

// Get session by ID
router.get('/:sessionId', liveSessionController.getSessionById);

// Update session (faculty only)
router.put(
  '/:sessionId',
  checkRole(['faculty', 'admin']),
  liveSessionController.updateSession
);

// Start session (faculty only)
router.post(
  '/:sessionId/start',
  checkRole(['faculty', 'admin']),
  liveSessionController.startSession
);

// End session (faculty only)
router.post(
  '/:sessionId/end',
  checkRole(['faculty', 'admin']),
  liveSessionController.endSession
);

// Join session (students)
router.post('/:sessionId/join', liveSessionController.joinSession);

// Leave session (students)
router.post('/:sessionId/leave', liveSessionController.leaveSession);

// Cancel session (faculty only)
router.post(
  '/:sessionId/cancel',
  checkRole(['faculty', 'admin']),
  liveSessionController.cancelSession
);

// Get session statistics (faculty only)
router.get(
  '/:sessionId/statistics',
  checkRole(['faculty', 'admin']),
  liveSessionController.getSessionStatistics
);

export default router;
