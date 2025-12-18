import courseMaterialService from '../services/courseMaterialService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class CourseMaterialController {
  // Upload material
  uploadMaterial = asyncHandler(async (req, res) => {
    const material = await courseMaterialService.uploadMaterial(
      req.body,
      req.file,
      req.user._id
    );
    return ApiResponse.created(res, material, 'Material uploaded successfully');
  });

  // Get course materials
  getCourseMaterials = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { type, category, module, week, isPublished } = req.query;
    
    const materials = await courseMaterialService.getCourseMaterials(courseId, {
      type,
      category,
      module,
      week: week ? parseInt(week) : undefined,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
    });
    return ApiResponse.success(res, materials);
  });

  // Get material by ID
  getMaterialById = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const material = await courseMaterialService.getMaterialById(materialId);
    return ApiResponse.success(res, material);
  });

  // Update material
  updateMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const material = await courseMaterialService.updateMaterial(
      materialId,
      req.body,
      req.user._id
    );
    return ApiResponse.success(res, material, 'Material updated successfully');
  });

  // Delete material
  deleteMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const result = await courseMaterialService.deleteMaterial(
      materialId,
      req.user._id
    );
    return ApiResponse.success(res, result);
  });

  // Increment download
  incrementDownload = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const material = await courseMaterialService.incrementDownload(materialId);
    return ApiResponse.success(res, material);
  });

  // Get materials by module
  getMaterialsByModule = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const materials = await courseMaterialService.getMaterialsByModule(courseId);
    return ApiResponse.success(res, materials);
  });

  // Get materials by week
  getMaterialsByWeek = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const materials = await courseMaterialService.getMaterialsByWeek(courseId);
    return ApiResponse.success(res, materials);
  });

  // Search materials
  searchMaterials = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { q } = req.query;
    
    const materials = await courseMaterialService.searchMaterials(courseId, q);
    return ApiResponse.success(res, materials);
  });

  // Reorder materials
  reorderMaterials = asyncHandler(async (req, res) => {
    const { materialIds } = req.body;
    const result = await courseMaterialService.reorderMaterials(materialIds);
    return ApiResponse.success(res, result);
  });

  // Get material statistics
  getMaterialStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const statistics = await courseMaterialService.getMaterialStatistics(courseId);
    return ApiResponse.success(res, statistics);
  });
}

export default new CourseMaterialController();
