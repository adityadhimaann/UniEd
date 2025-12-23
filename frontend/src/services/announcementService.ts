import api from '@/lib/api';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'students' | 'faculty';
  course?: {
    _id: string;
    courseName: string;
    courseCode: string;
  };
  attachments: string[];
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  expiresAt?: string;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  targetAudience?: 'all' | 'students' | 'faculty';
  courseId?: string;
  expiresAt?: string;
  attachments?: string[];
}

class AnnouncementService {
  async getAnnouncements(params?: {
    courseId?: string;
    priority?: string;
    targetAudience?: string;
    includeExpired?: boolean;
  }) {
    const response = await api.get('/announcements', { params });
    return response.data;
  }

  async getAnnouncementById(id: string) {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  }

  async getCourseAnnouncements(courseId: string) {
    const response = await api.get(`/announcements/course/${courseId}`);
    return response.data;
  }

  async createAnnouncement(data: CreateAnnouncementData) {
    const response = await api.post('/announcements', data);
    return response.data;
  }

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>) {
    const response = await api.patch(`/announcements/${id}`, data);
    return response.data;
  }

  async deleteAnnouncement(id: string) {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
}

export default new AnnouncementService();
