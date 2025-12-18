import api from '@/lib/api';

export interface Reply {
  _id: string;
  author: any;
  content: string;
  attachments?: string[];
  likes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  _id: string;
  course: string;
  author: any;
  title: string;
  content: string;
  category: 'general' | 'question' | 'announcement' | 'resource' | 'discussion';
  tags: string[];
  attachments?: string[];
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  likes: string[];
  replies: Reply[];
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

class DiscussionService {
  // Create discussion
  async createDiscussion(discussionData: Partial<Discussion>) {
    const response = await api.post('/discussions', discussionData);
    return response.data;
  }

  // Get course discussions
  async getCourseDiscussions(courseId: string, filters?: { category?: string; tags?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tags) params.append('tags', filters.tags);
    
    const response = await api.get(`/discussions/course/${courseId}?${params.toString()}`);
    return response.data;
  }

  // Get discussion by ID
  async getDiscussionById(discussionId: string) {
    const response = await api.get(`/discussions/${discussionId}`);
    return response.data;
  }

  // Update discussion
  async updateDiscussion(discussionId: string, updates: Partial<Discussion>) {
    const response = await api.put(`/discussions/${discussionId}`, updates);
    return response.data;
  }

  // Delete discussion
  async deleteDiscussion(discussionId: string) {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  }

  // Add reply
  async addReply(discussionId: string, content: string, attachments?: string[]) {
    const response = await api.post(`/discussions/${discussionId}/replies`, {
      content,
      attachments,
    });
    return response.data;
  }

  // Update reply
  async updateReply(discussionId: string, replyId: string, content: string) {
    const response = await api.put(`/discussions/${discussionId}/replies/${replyId}`, {
      content,
    });
    return response.data;
  }

  // Delete reply
  async deleteReply(discussionId: string, replyId: string) {
    const response = await api.delete(`/discussions/${discussionId}/replies/${replyId}`);
    return response.data;
  }

  // Toggle like
  async toggleLike(discussionId: string) {
    const response = await api.post(`/discussions/${discussionId}/like`);
    return response.data;
  }

  // Toggle reply like
  async toggleReplyLike(discussionId: string, replyId: string) {
    const response = await api.post(`/discussions/${discussionId}/replies/${replyId}/like`);
    return response.data;
  }

  // Toggle pin (faculty)
  async togglePin(discussionId: string) {
    const response = await api.post(`/discussions/${discussionId}/pin`);
    return response.data;
  }

  // Toggle lock (faculty)
  async toggleLock(discussionId: string) {
    const response = await api.post(`/discussions/${discussionId}/lock`);
    return response.data;
  }
}

export default new DiscussionService();
