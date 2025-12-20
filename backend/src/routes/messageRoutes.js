import express from 'express';
import messageController from '../controllers/messageController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get faculty by course (for students)
router.get('/faculty-by-course', messageController.getFacultyByCourse);

// Get all users (for starting new conversation)
router.get('/users', messageController.getUsers);

// Get messages with a specific user
router.get('/:otherUserId', messageController.getMessages);

// Send a message
router.post('/send', messageController.sendMessageHTTP);

// Mark messages as read
router.patch('/:otherUserId/read', messageController.markAsRead);

// Delete conversation
router.delete('/:otherUserId', messageController.deleteConversation);

export default router;
