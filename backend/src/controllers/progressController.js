import progressService from '../services/progressService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class ProgressController {
  // Get student progress for a course
  getStudentProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.role === 'student' ? req.user._id : req.query.studentId;
    
    const progress = await progressService.getStudentProgress(studentId, courseId);
    return ApiResponse.success(res, progress);
  });

  // Get all progress for a student
  getAllStudentProgress = asyncHandler(async (req, res) => {
    const studentId = req.user.role === 'student' ? req.user._id : req.query.studentId;
    
    const progressList = await progressService.getAllStudentProgress(studentId);
    return ApiResponse.success(res, progressList);
  });

  // Update module progress
  updateModuleProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { moduleId, moduleName, completed } = req.body;
    
    const progress = await progressService.updateModuleProgress(
      req.user._id,
      courseId,
      moduleId,
      moduleName,
      completed
    );
    return ApiResponse.success(res, progress, 'Module progress updated');
  });

  // Update material progress
  updateMaterialProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { moduleId, materialId, viewed, progress: progressPercentage } = req.body;
    
    const progress = await progressService.updateMaterialProgress(
      req.user._id,
      courseId,
      moduleId,
      materialId,
      viewed,
      progressPercentage
    );
    return ApiResponse.success(res, progress, 'Material progress updated');
  });

  // Add time spent
  addTimeSpent = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { minutes } = req.body;
    
    const progress = await progressService.addTimeSpent(
      req.user._id,
      courseId,
      minutes
    );
    return ApiResponse.success(res, progress);
  });

  // Issue certificate
  issueCertificate = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.body.studentId || req.user._id;
    
    const certificate = await progressService.issueCertificate(studentId, courseId);
    return ApiResponse.created(res, certificate, 'Certificate issued successfully');
  });

  // Get course progress statistics (instructor)
  getCourseProgressStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    const statistics = await progressService.getCourseProgressStatistics(courseId);
    return ApiResponse.success(res, statistics);
  });
}

export default new ProgressController();
