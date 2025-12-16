import express from 'express';
import authRoutes from './authRoutes.js';
import messageRoutes from './messageRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import instructorRoutes from './instructorRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/messages`, messageRoutes);
router.use(`${API_VERSION}/instructor`, instructorRoutes);
router.use(`${API_VERSION}/student`, studentRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

export default router;
