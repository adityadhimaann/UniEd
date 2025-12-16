import api from '@/lib/api';
import { type ApiResponse } from './authService';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  department?: string;
  semester?: number;
}

class ProfileService {
  async updateProfile(data: ProfileUpdateData) {
    const response = await api.patch<ApiResponse<any>>(
      '/auth/profile',
      data
    );
    
    // If tokens are returned, update localStorage
    const result = response.data.data;
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    
    return result.user || result;
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post<ApiResponse<any>>(
      '/auth/profile/picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // If tokens are returned, update localStorage
    const result = response.data.data;
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    
    return result.user || result;
  }
}

export default new ProfileService();
