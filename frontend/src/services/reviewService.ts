import api from '@/lib/api';
import { type ApiResponse } from './authService';

export interface Review {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  createdAt: string;
}

export interface CreateReviewData {
  content: string;
  rating: number;
  role: string;
  name?: string;
  image?: string;
}

class ReviewService {
  async getPublishedReviews() {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/published');
    return response.data.data;
  }

  async createReview(data: CreateReviewData) {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  }

  async getUserReview() {
    const response = await api.get<ApiResponse<Review>>('/reviews/my-review');
    return response.data.data;
  }

  async deleteReview(reviewId: string) {
    const response = await api.delete<ApiResponse<any>>(`/reviews/${reviewId}`);
    return response.data.data;
  }
}

export default new ReviewService();
