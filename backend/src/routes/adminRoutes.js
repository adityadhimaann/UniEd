import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(checkRole('admin'));

// Statistics
router.get('/statistics', adminController.getStatistics);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Course Management
router.get('/courses', adminController.getAllCourses);
router.delete('/courses/:courseId', adminController.deleteCourse);

// System Management
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/backup', adminController.createBackup);

export default router;
