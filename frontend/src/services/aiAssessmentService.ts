import axios from 'axios';

const API_URL = import.meta.env.VITE_AI_ASSESSMENT_API_URL || 'https://lisa-ai-backend.onrender.com/api';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface StartSessionRequest {
  topic: string;
  initial_difficulty: Difficulty;
}

export interface StartSessionResponse {
  session_id: string;
  message: string;
}

export interface QuestionResponse {
  question_id: string;
  question_text: string;
  difficulty: Difficulty;
}

export interface SubmitAnswerRequest {
  session_id: string;
  question_id: string;
  answer_text: string;
}

export interface SubmitAnswerResponse {
  score: number;
  is_correct: boolean;
  feedback_text: string;
  new_difficulty: Difficulty;
}

export interface VoiceFeedbackRequest {
  feedback_text: string;
}

const aiAssessmentService = {
  async startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await axios.post(`${API_URL}/start-session`, data);
    return response.data;
  },

  async getNextQuestion(sessionId: string): Promise<QuestionResponse> {
    const response = await axios.get(`${API_URL}/get-next-question`, {
      params: { session_id: sessionId }
    });
    return response.data;
  },

  async submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await axios.post(`${API_URL}/submit-answer`, data);
    return response.data;
  },

  async transcribeAudio(audioFile: File): Promise<{ transcribed_text: string }> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    const response = await axios.post(`${API_URL}/transcribe-audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async generateVoiceFeedback(data: VoiceFeedbackRequest): Promise<Blob> {
    const response = await axios.post(`${API_URL}/generate-voice-feedback`, data, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default aiAssessmentService;
