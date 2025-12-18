import api from '@/lib/api';

export interface CourseMaterial {
  _id: string;
  course: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'presentation' | 'code' | 'other';
  fileUrl?: string;
  externalLink?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category: 'lecture' | 'reading' | 'reference' | 'supplementary' | 'assignment' | 'other';
  module?: string;
  week?: number;
  order: number;
  isPublished: boolean;
  accessLevel: 'all' | 'enrolled' | 'premium';
  downloads: number;
  views: number;
  uploadedBy: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

class MaterialService {
  // Upload material (faculty)
  async uploadMaterial(formData: FormData) {
    const response = await api.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get course materials
  async getCourseMaterials(
    courseId: string,
    filters?: {
      type?: string;
      category?: string;
      module?: string;
      week?: number;
      isPublished?: boolean;
    }
  ) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.week) params.append('week', filters.week.toString());
    if (filters?.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString());
    
    const response = await api.get(`/materials/course/${courseId}?${params.toString()}`);
    return response.data;
  }

  // Get material by ID
  async getMaterialById(materialId: string) {
    const response = await api.get(`/materials/${materialId}`);
    return response.data;
  }

  // Update material (faculty)
  async updateMaterial(materialId: string, updates: Partial<CourseMaterial>) {
    const response = await api.put(`/materials/${materialId}`, updates);
    return response.data;
  }

  // Delete material (faculty)
  async deleteMaterial(materialId: string) {
    const response = await api.delete(`/materials/${materialId}`);
    return response.data;
  }

  // Increment download
  async incrementDownload(materialId: string) {
    const response = await api.post(`/materials/${materialId}/download`);
    return response.data;
  }

  // Get materials by module
  async getMaterialsByModule(courseId: string) {
    const response = await api.get(`/materials/course/${courseId}/by-module`);
    return response.data;
  }

  // Get materials by week
  async getMaterialsByWeek(courseId: string) {
    const response = await api.get(`/materials/course/${courseId}/by-week`);
    return response.data;
  }

  // Search materials
  async searchMaterials(courseId: string, query: string) {
    const response = await api.get(`/materials/course/${courseId}/search?q=${query}`);
    return response.data;
  }

  // Reorder materials (faculty)
  async reorderMaterials(materialIds: string[]) {
    const response = await api.post('/materials/reorder', { materialIds });
    return response.data;
  }

  // Get material statistics (faculty)
  async getMaterialStatistics(courseId: string) {
    const response = await api.get(`/materials/course/${courseId}/statistics`);
    return response.data;
  }
}

export default new MaterialService();
