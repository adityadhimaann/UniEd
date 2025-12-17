import express from 'express';
import * as courseEnrollmentController from '../controllers/courseEnrollmentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Student routes
router.post('/', courseEnrollmentController.createEnrollmentRequest);
router.get('/my-requests', courseEnrollmentController.getMyEnrollmentRequests);

// Instructor routes
router.get('/', courseEnrollmentController.getEnrollmentRequests);
router.patch('/:id', courseEnrollmentController.respondToEnrollmentRequest);

// Shared routes
router.get('/:id', courseEnrollmentController.getEnrollmentRequestById);

export default router;

