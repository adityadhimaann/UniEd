import express from 'express';
import virtualClassController from '../controllers/virtualClassController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my virtual classes (must be before /:classId to avoid route conflict)
router.get('/my-classes', virtualClassController.getMyVirtualClasses);

// Create virtual class (faculty only)
router.post('/', virtualClassController.createVirtualClass);

// Get course virtual classes
router.get('/course/:courseId', virtualClassController.getCourseVirtualClasses);

// Get virtual class by ID
router.get('/:classId', virtualClassController.getVirtualClassById);

// Start virtual class
router.post('/:classId/start', virtualClassController.startVirtualClass);

// End virtual class
router.post('/:classId/end', virtualClassController.endVirtualClass);

// Join virtual class
router.post('/:classId/join', virtualClassController.joinVirtualClass);

// Leave virtual class
router.post('/:classId/leave', virtualClassController.leaveVirtualClass);

// Send chat message
router.post('/:classId/chat', virtualClassController.sendChatMessage);

// Create poll
router.post('/:classId/poll', virtualClassController.createPoll);

// Vote on poll
router.post('/:classId/poll/:pollId/vote', virtualClassController.voteOnPoll);

// Update whiteboard
router.put('/:classId/whiteboard', virtualClassController.updateWhiteboard);

// Share file
router.post('/:classId/file', virtualClassController.shareFile);

// Toggle participant setting
router.patch('/:classId/participant/:participantId', virtualClassController.toggleParticipantSetting);

// Update class settings
router.put('/:classId/settings', virtualClassController.updateClassSettings);

// Delete virtual class
router.delete('/:classId', virtualClassController.deleteVirtualClass);

export default router;
