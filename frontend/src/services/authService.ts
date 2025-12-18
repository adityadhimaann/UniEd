import api from '@/lib/api';
import { UserRole } from '@/contexts/AuthContext';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  semester?: number;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    name?: string;
    profilePicture?: string;
    avatar?: string;
    studentId?: string;
    employeeId?: string;
    department?: string;
    semester?: number;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await api.get<ApiResponse<AuthResponse['user']>>(
      '/auth/profile'
    );
    return response.data.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const response = await api.post<ApiResponse<{ message: string; resetToken?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      { token, newPassword }
    );
    return response.data.data;
  }

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      '/auth/account'
    );
    return response.data.data;
  }
}

export default new AuthService();
