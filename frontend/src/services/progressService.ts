import api from '@/lib/api';

export interface Progress {
  _id: string;
  student: string;
  course: any;
  overallProgress: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    completed: boolean;
    completedAt?: string;
    timeSpent: number;
    materials: Array<{
      materialId: string;
      viewed: boolean;
      viewedAt?: string;
      progress: number;
    }>;
  }>;
  assignments: {
    total: number;
    completed: number;
    pending: number;
    averageGrade: number;
  };
  quizzes: {
    total: number;
    completed: number;
    averageScore: number;
  };
  attendance: {
    total: number;
    present: number;
    percentage: number;
  };
  timeSpent: number;
  lastAccessed: string;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
}

class ProgressService {
  // Get student progress for a course
  async getStudentProgress(courseId: string, studentId?: string) {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await api.get(`/progress/course/${courseId}${params}`);
    return response.data;
  }

  // Get all progress for a student
  async getAllStudentProgress(studentId?: string) {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await api.get(`/progress${params}`);
    return response.data;
  }

  // Update module progress (student)
  async updateModuleProgress(
    courseId: string,
    moduleId: string,
    moduleName: string,
    completed: boolean
  ) {
    const response = await api.post(`/progress/course/${courseId}/module`, {
      moduleId,
      moduleName,
      completed,
    });
    return response.data;
  }

  // Update material progress (student)
  async updateMaterialProgress(
    courseId: string,
    moduleId: string,
    materialId: string,
    viewed: boolean,
    progress: number
  ) {
    const response = await api.post(`/progress/course/${courseId}/material`, {
      moduleId,
      materialId,
      viewed,
      progress,
    });
    return response.data;
  }

  // Add time spent (student)
  async addTimeSpent(courseId: string, minutes: number) {
    const response = await api.post(`/progress/course/${courseId}/time`, {
      minutes,
    });
    return response.data;
  }

  // Issue certificate (faculty)
  async issueCertificate(courseId: string, studentId?: string) {
    const response = await api.post(`/progress/course/${courseId}/certificate`, {
      studentId,
    });
    return response.data;
  }

  // Get course progress statistics (faculty)
  async getCourseProgressStatistics(courseId: string) {
    const response = await api.get(`/progress/course/${courseId}/statistics`);
    return response.data;
  }
}

export default new ProgressService();
