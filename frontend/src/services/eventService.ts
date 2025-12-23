import api from '@/lib/api';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  type: 'lecture' | 'deadline' | 'meeting' | 'office-hours' | 'lab' | 'exam' | 'assignment' | 'virtual-class' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  course?: {
    _id: string;
    courseName: string;
    courseCode: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  participants?: string[];
  isAllDay: boolean;
  color: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  recurrence?: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
  source?: 'assignment' | 'virtual-class';
  sourceId?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  type: Event['type'];
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  course?: string;
  participants?: string[];
  isAllDay?: boolean;
  color?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  recurrence?: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
}

class EventService {
  async getMyEvents(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    courseId?: string;
  }) {
    const response = await api.get('/events', { params });
    return response.data;
  }

  async getEventById(id: string) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  }

  async getCourseEvents(courseId: string) {
    const response = await api.get(`/events/course/${courseId}`);
    return response.data;
  }

  async createEvent(data: CreateEventData) {
    const response = await api.post('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventData>) {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
}

export default new EventService();
