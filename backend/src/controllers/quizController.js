import quizService from '../services/quizService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class QuizController {
  // Create quiz
  createQuiz = asyncHandler(async (req, res) => {
    const quiz = await quizService.createQuiz(req.body, req.user._id);
    return ApiResponse.created(res, quiz, 'Quiz created successfully');
  });

  // Get course quizzes
  getCourseQuizzes = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const quizzes = await quizService.getCourseQuizzes(
      courseId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, quizzes);
  });

  // Get quiz by ID
  getQuizById = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const quiz = await quizService.getQuizById(
      quizId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, quiz);
  });

  // Start quiz attempt
  startQuizAttempt = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const result = await quizService.startQuizAttempt(quizId, req.user._id);
    return ApiResponse.success(res, result, 'Quiz attempt started');
  });

  // Submit quiz attempt
  submitQuizAttempt = asyncHandler(async (req, res) => {
    const { quizId, attemptId } = req.params;
    const { answers } = req.body;
    const result = await quizService.submitQuizAttempt(
      quizId,
      attemptId,
      answers,
      req.user._id
    );
    return ApiResponse.success(res, result, 'Quiz submitted successfully');
  });

  // Update quiz
  updateQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const quiz = await quizService.updateQuiz(quizId, req.body, req.user._id);
    return ApiResponse.success(res, quiz, 'Quiz updated successfully');
  });

  // Delete quiz
  deleteQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const result = await quizService.deleteQuiz(quizId, req.user._id);
    return ApiResponse.success(res, result);
  });

  // Get quiz statistics
  getQuizStatistics = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const statistics = await quizService.getQuizStatistics(quizId, req.user._id);
    return ApiResponse.success(res, statistics);
  });
}

export default new QuizController();
