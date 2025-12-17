import express from 'express';
import authRoutes from './authRoutes.js';
import messageRoutes from './messageRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import instructorRoutes from './instructorRoutes.js';
import studentRoutes from './studentRoutes.js';
import oauthRoutes from './oauthRoutes.js';
import newsletterRoutes from './newsletterRoutes.js';
import courseEnrollmentRoutes from './courseEnrollmentRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/oauth', oauthRoutes);
router.use('/api/v1/reviews', reviewRoutes);
router.use('/api/v1/messages', messageRoutes);
router.use('/api/v1/instructor', instructorRoutes);
router.use('/api/v1/student', studentRoutes);
router.use('/api/v1/newsletter', newsletterRoutes);
router.use('/api/v1/course-enrollment-requests', courseEnrollmentRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

export default router;
