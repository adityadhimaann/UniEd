import api from '@/lib/api';

export interface LiveSession {
  _id: string;
  course: string;
  title: string;
  description?: string;
  instructor: any;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  platform: 'zoom' | 'google-meet' | 'microsoft-teams' | 'custom' | 'other';
  recordingUrl?: string;
  isRecorded: boolean;
  participants: Array<{
    user: any;
    joinedAt: string;
    leftAt?: string;
    duration: number;
    isPresent: boolean;
  }>;
  maxParticipants: number;
  agenda?: string;
  materials?: string[];
  notes?: string;
  participantCount: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

class LiveSessionService {
  // Create live session (faculty)
  async createLiveSession(sessionData: Partial<LiveSession>) {
    const response = await api.post('/live-sessions', sessionData);
    return response.data;
  }

  // Get course sessions
  async getCourseSessions(courseId: string, filters?: { status?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    
    const response = await api.get(`/live-sessions/course/${courseId}?${params.toString()}`);
    return response.data;
  }

  // Get session by ID
  async getSessionById(sessionId: string) {
    const response = await api.get(`/live-sessions/${sessionId}`);
    return response.data;
  }

  // Update session (faculty)
  async updateSession(sessionId: string, updates: Partial<LiveSession>) {
    const response = await api.put(`/live-sessions/${sessionId}`, updates);
    return response.data;
  }

  // Start session (faculty)
  async startSession(sessionId: string) {
    const response = await api.post(`/live-sessions/${sessionId}/start`);
    return response.data;
  }

  // End session (faculty)
  async endSession(sessionId: string) {
    const response = await api.post(`/live-sessions/${sessionId}/end`);
    return response.data;
  }

  // Join session (student)
  async joinSession(sessionId: string) {
    const response = await api.post(`/live-sessions/${sessionId}/join`);
    return response.data;
  }

  // Leave session (student)
  async leaveSession(sessionId: string) {
    const response = await api.post(`/live-sessions/${sessionId}/leave`);
    return response.data;
  }

  // Cancel session (faculty)
  async cancelSession(sessionId: string, reason?: string) {
    const response = await api.post(`/live-sessions/${sessionId}/cancel`, { reason });
    return response.data;
  }

  // Get session statistics (faculty)
  async getSessionStatistics(sessionId: string) {
    const response = await api.get(`/live-sessions/${sessionId}/statistics`);
    return response.data;
  }
}

export default new LiveSessionService();
