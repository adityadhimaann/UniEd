import api from '@/lib/api';

export interface Question {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  course: string;
  title: string;
  description?: string;
  instructions?: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  availableFrom: string;
  availableUntil: string;
  isPublished: boolean;
  createdBy: any;
  myAttempts?: any[];
  attemptsRemaining?: number;
  canAttempt?: boolean;
}

export interface QuizAttempt {
  _id: string;
  student: string;
  answers: Array<{ questionIndex: number; answer: string }>;
  score: number;
  percentage: number;
  submittedAt?: string;
  timeSpent: number;
  isGraded: boolean;
}

class QuizService {
  // Create quiz (faculty)
  async createQuiz(quizData: Partial<Quiz>) {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  }

  // Get course quizzes
  async getCourseQuizzes(courseId: string) {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data;
  }

  // Get quiz by ID
  async getQuizById(quizId: string) {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  }

  // Update quiz (faculty)
  async updateQuiz(quizId: string, updates: Partial<Quiz>) {
    const response = await api.put(`/quizzes/${quizId}`, updates);
    return response.data;
  }

  // Delete quiz (faculty)
  async deleteQuiz(quizId: string) {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  }

  // Start quiz attempt (student)
  async startQuizAttempt(quizId: string) {
    const response = await api.post(`/quizzes/${quizId}/attempt`);
    return response.data;
  }

  // Submit quiz attempt (student)
  async submitQuizAttempt(
    quizId: string,
    attemptId: string,
    answers: Array<{ questionIndex: number; answer: string }>
  ) {
    const response = await api.post(
      `/quizzes/${quizId}/attempt/${attemptId}/submit`,
      { answers }
    );
    return response.data;
  }

  // Get quiz statistics (faculty)
  async getQuizStatistics(quizId: string) {
    const response = await api.get(`/quizzes/${quizId}/statistics`);
    return response.data;
  }
}

export default new QuizService();
