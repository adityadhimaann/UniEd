import express from 'express';
import discussionController from '../controllers/discussionController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create discussion
router.post('/', discussionController.createDiscussion);

// Get course discussions
router.get('/course/:courseId', discussionController.getCourseDiscussions);

// Get discussion by ID
router.get('/:discussionId', discussionController.getDiscussionById);

// Update discussion
router.put('/:discussionId', discussionController.updateDiscussion);

// Delete discussion
router.delete('/:discussionId', discussionController.deleteDiscussion);

// Add reply
router.post('/:discussionId/replies', discussionController.addReply);

// Update reply
router.put('/:discussionId/replies/:replyId', discussionController.updateReply);

// Delete reply
router.delete('/:discussionId/replies/:replyId', discussionController.deleteReply);

// Toggle like
router.post('/:discussionId/like', discussionController.toggleLike);

// Toggle reply like
router.post('/:discussionId/replies/:replyId/like', discussionController.toggleReplyLike);

// Toggle pin (faculty only)
router.post(
  '/:discussionId/pin',
  checkRole(['faculty', 'admin']),
  discussionController.togglePin
);

// Toggle lock (faculty only)
router.post(
  '/:discussionId/lock',
  checkRole(['faculty', 'admin']),
  discussionController.toggleLock
);

export default router;
