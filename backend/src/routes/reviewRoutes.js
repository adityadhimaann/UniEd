import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// Public routes
router.get('/published', reviewController.getPublishedReviews);

// Protected routes
router.post('/', authenticate, reviewController.createReview);
router.get('/my-review', authenticate, reviewController.getUserReview);

// Admin routes
router.get('/all', authenticate, checkRole('admin'), reviewController.getAllReviews);
router.patch('/:reviewId/approve', authenticate, checkRole('admin'), reviewController.approveReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

export default router;
