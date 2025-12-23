import api from '@/lib/api';

export interface VirtualClass {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
  };
  host: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  meetingLink: string;
  password?: string;
  participants: Participant[];
  chatMessages: ChatMessage[];
  polls: Poll[];
  settings: ClassSettings;
  whiteboard?: {
    data: string;
    lastUpdated: string;
  };
  sharedFiles: SharedFile[];
}

export interface Participant {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  joinedAt: string;
  leftAt?: string;
  role: 'host' | 'co-host' | 'participant';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
}

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  isPrivate: boolean;
  recipient?: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: {
    text: string;
    votes: string[];
  }[];
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface ClassSettings {
  allowParticipantVideo: boolean;
  allowParticipantAudio: boolean;
  allowParticipantScreenShare: boolean;
  allowParticipantChat: boolean;
  enableWaitingRoom: boolean;
  recordSession: boolean;
  maxParticipants: number;
}

export interface SharedFile {
  _id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const virtualClassService = {
  // Create virtual class
  async createVirtualClass(classData: {
    title: string;
    description?: string;
    course: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    password?: string;
    settings?: Partial<ClassSettings>;
  }) {
    const response = await api.post('/virtual-classes', classData);
    return response.data;
  },

  // Get course virtual classes
  async getCourseVirtualClasses(courseId: string) {
    const response = await api.get(`/virtual-classes/course/${courseId}`);
    return response.data;
  },

  // Get my virtual classes (all enrolled courses)
  async getMyVirtualClasses() {
    const response = await api.get('/virtual-classes/my-classes');
    return response.data;
  },

  // Get virtual class by ID
  async getVirtualClassById(classId: string) {
    const response = await api.get(`/virtual-classes/${classId}`);
    return response.data;
  },

  // Start virtual class
  async startVirtualClass(classId: string) {
    const response = await api.post(`/virtual-classes/${classId}/start`);
    return response.data;
  },

  // End virtual class
  async endVirtualClass(classId: string) {
    const response = await api.post(`/virtual-classes/${classId}/end`);
    return response.data;
  },

  // Join virtual class
  async joinVirtualClass(classId: string, role?: string) {
    const response = await api.post(`/virtual-classes/${classId}/join`, { role });
    return response.data;
  },

  // Leave virtual class
  async leaveVirtualClass(classId: string) {
    const response = await api.post(`/virtual-classes/${classId}/leave`);
    return response.data;
  },

  // Send chat message
  async sendChatMessage(classId: string, message: string, isPrivate = false, recipientId?: string) {
    const response = await api.post(`/virtual-classes/${classId}/chat`, {
      message,
      isPrivate,
      recipientId,
    });
    return response.data;
  },

  // Create poll
  async createPoll(classId: string, question: string, options: string[]) {
    const response = await api.post(`/virtual-classes/${classId}/poll`, {
      question,
      options,
    });
    return response.data;
  },

  // Vote on poll
  async voteOnPoll(classId: string, pollId: string, optionIndex: number) {
    const response = await api.post(`/virtual-classes/${classId}/poll/${pollId}/vote`, {
      optionIndex,
    });
    return response.data;
  },

  // Update whiteboard
  async updateWhiteboard(classId: string, whiteboardData: string) {
    const response = await api.put(`/virtual-classes/${classId}/whiteboard`, {
      whiteboardData,
    });
    return response.data;
  },

  // Share file
  async shareFile(classId: string, name: string, url: string) {
    const response = await api.post(`/virtual-classes/${classId}/file`, {
      name,
      url,
    });
    return response.data;
  },

  // Toggle participant setting
  async toggleParticipantSetting(classId: string, participantId: string, setting: string, value: boolean) {
    const response = await api.patch(`/virtual-classes/${classId}/participant/${participantId}`, {
      setting,
      value,
    });
    return response.data;
  },

  // Update class settings
  async updateClassSettings(classId: string, settings: Partial<ClassSettings>) {
    const response = await api.put(`/virtual-classes/${classId}/settings`, settings);
    return response.data;
  },

  // Delete virtual class
  async deleteVirtualClass(classId: string) {
    const response = await api.delete(`/virtual-classes/${classId}`);
    return response.data;
  },
};
