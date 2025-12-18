import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import ApiError from '../utils/ApiError.js';
import { sendNotification } from '../socket/socketHandler.js';
import Notification from '../models/Notification.js';

class QuizService {
  // Create a new quiz
  async createQuiz(quizData, instructorId) {
    const quiz = await Quiz.create({
      ...quizData,
      createdBy: instructorId,
    });

    return quiz;
  }

  // Get all quizzes for a course
  async getCourseQuizzes(courseId, userId, userRole) {
    const query = { course: courseId };
    
    // Students only see published quizzes
    if (userRole === 'student') {
      query.isPublished = true;
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // For students, include their attempts
    if (userRole === 'student') {
      return quizzes.map(quiz => {
        const studentAttempts = quiz.attempts.filter(
          attempt => attempt.student.toString() === userId.toString()
        );
        
        return {
          ...quiz.toJSON(),
          myAttempts: studentAttempts,
          attemptsRemaining: quiz.attemptsAllowed - studentAttempts.length,
          canAttempt: studentAttempts.length < quiz.attemptsAllowed &&
            new Date() >= quiz.availableFrom &&
            new Date() <= quiz.availableUntil,
        };
      });
    }

    return quizzes;
  }

  // Get quiz by ID
  async getQuizById(quizId, userId, userRole) {
    const quiz = await Quiz.findById(quizId)
      .populate('createdBy', 'firstName lastName email')
      .populate('attempts.student', 'firstName lastName email');

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    // Students can only see published quizzes
    if (userRole === 'student' && !quiz.isPublished) {
      throw ApiError.forbidden('This quiz is not available yet');
    }

    // For students, hide correct answers until after submission
    if (userRole === 'student') {
      const studentAttempts = quiz.attempts.filter(
        attempt => attempt.student._id.toString() === userId.toString()
      );

      const quizData = quiz.toJSON();
      
      // Hide correct answers if not allowed to show
      if (!quiz.showCorrectAnswers || studentAttempts.length === 0) {
        quizData.questions = quizData.questions.map(q => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined,
        }));
      }

      return {
        ...quizData,
        myAttempts: studentAttempts,
        attemptsRemaining: quiz.attemptsAllowed - studentAttempts.length,
        canAttempt: studentAttempts.length < quiz.attemptsAllowed &&
          new Date() >= quiz.availableFrom &&
          new Date() <= quiz.availableUntil,
      };
    }

    return quiz;
  }

  // Start quiz attempt
  async startQuizAttempt(quizId, studentId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    if (!quiz.isPublished) {
      throw ApiError.forbidden('This quiz is not available yet');
    }

    // Check if quiz is available
    const now = new Date();
    if (now < quiz.availableFrom || now > quiz.availableUntil) {
      throw ApiError.forbidden('This quiz is not available at this time');
    }

    // Check attempts
    const studentAttempts = quiz.attempts.filter(
      attempt => attempt.student.toString() === studentId.toString()
    );

    if (studentAttempts.length >= quiz.attemptsAllowed) {
      throw ApiError.forbidden('You have used all your attempts for this quiz');
    }

    // Create new attempt
    const attempt = {
      student: studentId,
      answers: [],
      totalPoints: quiz.totalPoints,
      startedAt: new Date(),
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    // Return quiz without correct answers
    const quizData = quiz.toJSON();
    quizData.questions = quizData.questions.map(q => ({
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return {
      quiz: quizData,
      attemptId: quiz.attempts[quiz.attempts.length - 1]._id,
      timeLimit: quiz.timeLimit,
    };
  }

  // Submit quiz attempt
  async submitQuizAttempt(quizId, attemptId, answers, studentId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    const attempt = quiz.attempts.id(attemptId);

    if (!attempt) {
      throw ApiError.notFound('Attempt not found');
    }

    if (attempt.student.toString() !== studentId.toString()) {
      throw ApiError.forbidden('This is not your attempt');
    }

    if (attempt.submittedAt) {
      throw ApiError.badRequest('This attempt has already been submitted');
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = [];

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      let isCorrect = false;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = answer.answer === question.correctAnswer;
        if (isCorrect) {
          score += question.points;
        }
      } else if (question.type === 'short-answer') {
        // Case-insensitive comparison for short answers
        isCorrect = answer.answer.toLowerCase().trim() === 
          question.correctAnswer.toLowerCase().trim();
        if (isCorrect) {
          score += question.points;
        }
      }
      // Essay questions need manual grading

      gradedAnswers.push({
        questionIndex: index,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      });
    });

    // Update attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.percentage = Math.round((score / quiz.totalPoints) * 100);
    attempt.submittedAt = new Date();
    attempt.timeSpent = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
    attempt.isGraded = !quiz.questions.some(q => q.type === 'essay');

    await quiz.save();

    // Update progress
    await this.updateQuizProgress(studentId, quiz.course);

    // Send notification
    const notification = await Notification.create({
      user: studentId,
      type: 'quiz-result',
      title: 'Quiz Submitted',
      message: `You scored ${attempt.percentage}% on "${quiz.title}"`,
      metadata: {
        quizId: quiz._id,
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
      },
    });

    sendNotification(studentId.toString(), notification);

    return {
      attempt,
      gradedAnswers: quiz.showCorrectAnswers ? gradedAnswers : undefined,
      passed: attempt.percentage >= quiz.passingScore,
    };
  }

  // Update quiz progress
  async updateQuizProgress(studentId, courseId) {
    const progress = await Progress.findOne({ student: studentId, course: courseId });

    if (!progress) return;

    const quizzes = await Quiz.find({ course: courseId, isPublished: true });
    const completedQuizzes = quizzes.filter(quiz => 
      quiz.attempts.some(
        attempt => attempt.student.toString() === studentId.toString() && 
        attempt.submittedAt
      )
    );

    const totalScore = completedQuizzes.reduce((sum, quiz) => {
      const studentAttempts = quiz.attempts.filter(
        attempt => attempt.student.toString() === studentId.toString()
      );
      const bestAttempt = studentAttempts.reduce((best, current) => 
        current.percentage > best.percentage ? current : best
      , { percentage: 0 });
      return sum + bestAttempt.percentage;
    }, 0);

    progress.quizzes = {
      total: quizzes.length,
      completed: completedQuizzes.length,
      averageScore: completedQuizzes.length > 0 ? Math.round(totalScore / completedQuizzes.length) : 0,
    };

    progress.calculateProgress();
    await progress.save();
  }

  // Update quiz
  async updateQuiz(quizId, updates, instructorId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    if (quiz.createdBy.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only update your own quizzes');
    }

    // Don't allow updates if students have already attempted
    if (quiz.attempts.length > 0 && (updates.questions || updates.totalPoints)) {
      throw ApiError.badRequest('Cannot modify questions after students have attempted the quiz');
    }

    Object.assign(quiz, updates);
    await quiz.save();

    return quiz;
  }

  // Delete quiz
  async deleteQuiz(quizId, instructorId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    if (quiz.createdBy.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only delete your own quizzes');
    }

    await quiz.deleteOne();
    return { message: 'Quiz deleted successfully' };
  }

  // Get quiz statistics
  async getQuizStatistics(quizId, instructorId) {
    const quiz = await Quiz.findById(quizId)
      .populate('attempts.student', 'firstName lastName email');

    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    if (quiz.createdBy.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only view statistics for your own quizzes');
    }

    const submittedAttempts = quiz.attempts.filter(a => a.submittedAt);

    const statistics = {
      totalAttempts: quiz.attempts.length,
      submittedAttempts: submittedAttempts.length,
      averageScore: submittedAttempts.length > 0
        ? Math.round(submittedAttempts.reduce((sum, a) => sum + a.percentage, 0) / submittedAttempts.length)
        : 0,
      highestScore: submittedAttempts.length > 0
        ? Math.max(...submittedAttempts.map(a => a.percentage))
        : 0,
      lowestScore: submittedAttempts.length > 0
        ? Math.min(...submittedAttempts.map(a => a.percentage))
        : 0,
      passRate: submittedAttempts.length > 0
        ? Math.round((submittedAttempts.filter(a => a.percentage >= quiz.passingScore).length / submittedAttempts.length) * 100)
        : 0,
      averageTimeSpent: submittedAttempts.length > 0
        ? Math.round(submittedAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / submittedAttempts.length)
        : 0,
      attempts: submittedAttempts.map(a => ({
        student: a.student,
        score: a.score,
        percentage: a.percentage,
        timeSpent: a.timeSpent,
        submittedAt: a.submittedAt,
      })),
    };

    return statistics;
  }
}

export default new QuizService();
