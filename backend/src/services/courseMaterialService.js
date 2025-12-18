import CourseMaterial from '../models/CourseMaterial.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

class CourseMaterialService {
  // Upload course material
  async uploadMaterial(materialData, file, instructorId) {
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let mimeType = null;

    if (file) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.path, 'unied/course-materials');
      fileUrl = result.secure_url;
      fileName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;

      // Delete local file
      await fs.unlink(file.path).catch(() => {});
    }

    const material = await CourseMaterial.create({
      ...materialData,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      uploadedBy: instructorId,
    });

    return material;
  }

  // Get all materials for a course
  async getCourseMaterials(courseId, filters = {}) {
    const query = { course: courseId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.module) {
      query.module = filters.module;
    }

    if (filters.week) {
      query.week = filters.week;
    }

    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }

    const materials = await CourseMaterial.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ order: 1, createdAt: -1 });

    return materials;
  }

  // Get material by ID
  async getMaterialById(materialId) {
    const material = await CourseMaterial.findById(materialId)
      .populate('uploadedBy', 'firstName lastName email avatar');

    if (!material) {
      throw ApiError.notFound('Material not found');
    }

    // Increment views
    material.views += 1;
    await material.save();

    return material;
  }

  // Update material
  async updateMaterial(materialId, updates, instructorId) {
    const material = await CourseMaterial.findById(materialId);

    if (!material) {
      throw ApiError.notFound('Material not found');
    }

    if (material.uploadedBy.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only update your own materials');
    }

    Object.assign(material, updates);
    await material.save();

    return material;
  }

  // Delete material
  async deleteMaterial(materialId, instructorId) {
    const material = await CourseMaterial.findById(materialId);

    if (!material) {
      throw ApiError.notFound('Material not found');
    }

    if (material.uploadedBy.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only delete your own materials');
    }

    // Delete from Cloudinary if it's a file
    if (material.fileUrl && material.type !== 'link') {
      try {
        await deleteFromCloudinary(material.fileUrl);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    await material.deleteOne();
    return { message: 'Material deleted successfully' };
  }

  // Increment download count
  async incrementDownload(materialId) {
    const material = await CourseMaterial.findById(materialId);

    if (!material) {
      throw ApiError.notFound('Material not found');
    }

    material.downloads += 1;
    await material.save();

    return material;
  }

  // Get materials by module
  async getMaterialsByModule(courseId) {
    const materials = await CourseMaterial.find({ 
      course: courseId, 
      isPublished: true 
    })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ module: 1, order: 1 });

    // Group by module
    const grouped = materials.reduce((acc, material) => {
      const module = material.module || 'Uncategorized';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(material);
      return acc;
    }, {});

    return grouped;
  }

  // Get materials by week
  async getMaterialsByWeek(courseId) {
    const materials = await CourseMaterial.find({ 
      course: courseId, 
      isPublished: true,
      week: { $exists: true }
    })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ week: 1, order: 1 });

    // Group by week
    const grouped = materials.reduce((acc, material) => {
      const week = material.week || 0;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(material);
      return acc;
    }, {});

    return grouped;
  }

  // Search materials
  async searchMaterials(courseId, searchTerm) {
    const materials = await CourseMaterial.find({
      course: courseId,
      isPublished: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ order: 1 });

    return materials;
  }

  // Reorder materials
  async reorderMaterials(materialIds) {
    const promises = materialIds.map((id, index) => 
      CourseMaterial.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(promises);

    return { message: 'Materials reordered successfully' };
  }

  // Get material statistics
  async getMaterialStatistics(courseId) {
    const materials = await CourseMaterial.find({ course: courseId });

    const statistics = {
      total: materials.length,
      byType: {},
      byCategory: {},
      totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
      totalViews: materials.reduce((sum, m) => sum + m.views, 0),
      totalSize: materials.reduce((sum, m) => sum + (m.fileSize || 0), 0),
      published: materials.filter(m => m.isPublished).length,
      unpublished: materials.filter(m => !m.isPublished).length,
    };

    // Count by type
    materials.forEach(m => {
      statistics.byType[m.type] = (statistics.byType[m.type] || 0) + 1;
      statistics.byCategory[m.category] = (statistics.byCategory[m.category] || 0) + 1;
    });

    return statistics;
  }
}

export default new CourseMaterialService();
