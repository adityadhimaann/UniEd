import api from '@/lib/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Conversation {
  _id: string;
  user: User;
  lastMessage: string | null;
  unreadCount: number;
  lastMessageTime: string;
}

export interface FacultyByCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  faculty: User;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  isRead?: boolean;
}

/**
 * Get all conversations for the current user
 */
const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/messages/conversations');
  return response.data.data;
};

/**
 * Get faculty members from student's enrolled courses
 */
const getFacultyByCourse = async (courseId?: string): Promise<FacultyByCourse[]> => {
  const params = courseId ? `?courseId=${courseId}` : '';
  const response = await api.get(`/messages/faculty-by-course${params}`);
  return response.data.data;
};

/**
 * Get all users (for starting new conversation)
 */
const getUsers = async (search?: string, role?: string): Promise<User[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  
  const response = await api.get(`/messages/users?${params.toString()}`);
  return response.data.data;
};

/**
 * Get messages with a specific user
 */
const getMessages = async (
  otherUserId: string, 
  page = 1, 
  limit = 50
): Promise<{ messages: Message[]; pagination: any }> => {
  const response = await api.get(`/messages/${otherUserId}?page=${page}&limit=${limit}`);
  return response.data.data;
};

/**
 * Send a message
 */
const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  const response = await api.post('/messages/send', {
    receiverId,
    content,
  });
  return response.data.data;
};

/**
 * Mark messages as read
 */
const markAsRead = async (otherUserId: string): Promise<void> => {
  await api.patch(`/messages/${otherUserId}/read`);
};

/**
 * Delete a conversation
 */
const deleteConversation = async (otherUserId: string): Promise<void> => {
  await api.delete(`/messages/${otherUserId}`);
};

export default {
  getConversations,
  getFacultyByCourse,
  getUsers,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
};
