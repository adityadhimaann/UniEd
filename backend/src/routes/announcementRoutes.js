import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getCourseAnnouncements,
} from '../controllers/announcementController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (all authenticated users)
router.get('/', getAnnouncements);
router.get('/course/:courseId', getCourseAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected routes (faculty and admin only)
router.post('/', checkRole('faculty', 'admin'), createAnnouncement);
router.patch('/:id', checkRole('faculty', 'admin'), updateAnnouncement);
router.delete('/:id', checkRole('faculty', 'admin'), deleteAnnouncement);

export default router;
