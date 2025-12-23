import express from 'express';
import {
  getMyEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getCourseEvents,
} from '../controllers/eventController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my events
router.get('/', getMyEvents);

// Get course events
router.get('/course/:courseId', getCourseEvents);

// Get event by ID
router.get('/:id', getEventById);

// Create event (faculty and admin only)
router.post('/', checkRole('faculty', 'admin'), createEvent);

// Update event (creator or admin)
router.patch('/:id', updateEvent);

// Delete event (creator or admin)
router.delete('/:id', deleteEvent);

export default router;
