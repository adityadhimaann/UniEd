import express from 'express';
import courseMaterialController from '../controllers/courseMaterialController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/roleCheck.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload material (faculty only)
router.post(
  '/',
  checkRole(['faculty', 'admin']),
  upload.single('file'),
  courseMaterialController.uploadMaterial
);

// Get course materials
router.get('/course/:courseId', courseMaterialController.getCourseMaterials);

// Get materials by module
router.get('/course/:courseId/by-module', courseMaterialController.getMaterialsByModule);

// Get materials by week
router.get('/course/:courseId/by-week', courseMaterialController.getMaterialsByWeek);

// Search materials
router.get('/course/:courseId/search', courseMaterialController.searchMaterials);

// Get material statistics (faculty only)
router.get(
  '/course/:courseId/statistics',
  checkRole(['faculty', 'admin']),
  courseMaterialController.getMaterialStatistics
);

// Get material by ID
router.get('/:materialId', courseMaterialController.getMaterialById);

// Update material (faculty only)
router.put(
  '/:materialId',
  checkRole(['faculty', 'admin']),
  courseMaterialController.updateMaterial
);

// Delete material (faculty only)
router.delete(
  '/:materialId',
  checkRole(['faculty', 'admin']),
  courseMaterialController.deleteMaterial
);

// Increment download
router.post('/:materialId/download', courseMaterialController.incrementDownload);

// Reorder materials (faculty only)
router.post(
  '/reorder',
  checkRole(['faculty', 'admin']),
  courseMaterialController.reorderMaterials
);

export default router;
