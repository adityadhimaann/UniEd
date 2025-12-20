import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import quizService, { Quiz } from '@/services/quizService';
import { useAuth } from '@/contexts/AuthContext';
import { QuizTaker } from './QuizTaker';
import { QuizResults } from './QuizResults';

export function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);
  const [attemptData, setAttemptData] = useState<any>(null);

  // Mock course ID - replace with actual course selection
  const courseId = '6756c8b9e8f9a1b2c3d4e5f6';

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getCourseQuizzes(courseId);
      setQuizzes(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    if (!quiz.canAttempt) {
      toast.error('You cannot attempt this quiz at this time');
      return;
    }

    try {
      const response = await quizService.startQuizAttempt(quiz._id);
      setAttemptData(response.data);
      setSelectedQuiz(quiz);
      setTakingQuiz(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  const handleQuizComplete = (results: any) => {
    setTakingQuiz(false);
    setViewingResults(true);
    setAttemptData(results);
    loadQuizzes(); // Reload to update attempts
  };

  const handleCloseResults = () => {
    setViewingResults(false);
    setSelectedQuiz(null);
    setAttemptData(null);
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (!quiz.canAttempt && quiz.attemptsRemaining === 0) {
      return <Badge variant="destructive">No Attempts Left</Badge>;
    }
    if (quiz.myAttempts && quiz.myAttempts.length > 0) {
      const bestScore = Math.max(...quiz.myAttempts.map((a: any) => a.percentage));
      const passed = bestScore >= quiz.passingScore;
      return passed ? (
        <Badge className="bg-green-500">Passed ({bestScore}%)</Badge>
      ) : (
        <Badge variant="secondary">Attempted ({bestScore}%)</Badge>
      );
    }
    return <Badge variant="outline">Not Attempted</Badge>;
  };

  const isAvailable = (quiz: Quiz) => {
    const now = new Date();
    const from = new Date(quiz.availableFrom);
    const until = new Date(quiz.availableUntil);
    return now >= from && now <= until;
  };

  if (takingQuiz && selectedQuiz && attemptData) {
    return (
      <QuizTaker
        quiz={selectedQuiz}
        attemptData={attemptData}
        onComplete={handleQuizComplete}
        onCancel={() => setTakingQuiz(false)}
      />
    );
  }

  if (viewingResults && attemptData) {
    return (
      <QuizResults
        results={attemptData}
        quiz={selectedQuiz!}
        onClose={handleCloseResults}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {quizzes.filter(q => q.myAttempts && q.myAttempts.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {quizzes.filter(q => {
                if (!q.myAttempts || q.myAttempts.length === 0) return false;
                const bestScore = Math.max(...q.myAttempts.map((a: any) => a.percentage));
                return bestScore >= q.passingScore;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.filter(q => q.myAttempts && q.myAttempts.length > 0).length > 0
                ? Math.round(
                    quizzes
                      .filter(q => q.myAttempts && q.myAttempts.length > 0)
                      .reduce((sum, q) => {
                        const bestScore = Math.max(...q.myAttempts!.map((a: any) => a.percentage));
                        return sum + bestScore;
                      }, 0) /
                      quizzes.filter(q => q.myAttempts && q.myAttempts.length > 0).length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <img src="/loadicon.gif" alt="Loading" className="h-16 w-16 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available yet</p>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileQuestion className="w-5 h-5" />
                        {quiz.title}
                      </CardTitle>
                      {quiz.description && (
                        <CardDescription className="mt-2">{quiz.description}</CardDescription>
                      )}
                    </div>
                    {getStatusBadge(quiz)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quiz Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileQuestion className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.totalPoints} Points</span>
                    </div>
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{quiz.timeLimit} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {quiz.attemptsRemaining || 0} / {quiz.attemptsAllowed} attempts
                      </span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Available: {new Date(quiz.availableFrom).toLocaleDateString()} -{' '}
                      {new Date(quiz.availableUntil).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress Bar (if attempted) */}
                  {quiz.myAttempts && quiz.myAttempts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Best Score</span>
                        <span className="font-medium">
                          {Math.max(...quiz.myAttempts.map((a: any) => a.percentage))}%
                        </span>
                      </div>
                      <Progress
                        value={Math.max(...quiz.myAttempts.map((a: any) => a.percentage))}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {quiz.canAttempt && isAvailable(quiz) ? (
                      <Button onClick={() => handleStartQuiz(quiz)} className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        {quiz.myAttempts && quiz.myAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                      </Button>
                    ) : !isAvailable(quiz) ? (
                      <Button disabled className="flex-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Not Available
                      </Button>
                    ) : (
                      <Button disabled className="flex-1">
                        <XCircle className="w-4 h-4 mr-2" />
                        No Attempts Left
                      </Button>
                    )}
                    {quiz.myAttempts && quiz.myAttempts.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setAttemptData({ attempt: quiz.myAttempts![quiz.myAttempts!.length - 1] });
                          setViewingResults(true);
                        }}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
