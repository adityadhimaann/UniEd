import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import quizService, { Quiz } from '@/services/quizService';

interface QuizTakerProps {
  quiz: Quiz;
  attemptData: any;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

export function QuizTaker({ quiz, attemptData, onComplete, onCancel }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([index, answer]) => ({
        questionIndex: parseInt(index),
        answer,
      }));

      const response = await quizService.submitQuizAttempt(
        quiz._id,
        attemptData.attemptId,
        formattedAnswers
      );

      toast.success('Quiz submitted successfully!');
      onComplete(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const question = attemptData.quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / attemptData.quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Question {currentQuestion + 1} of {attemptData.quiz.questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5" />
                <span className={timeLeft < 60 ? 'text-red-500' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestion + 1}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({question.points} points)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <p className="text-lg">{question.question}</p>

              {/* Answer Input */}
              {question.type === 'multiple-choice' && (
                <RadioGroup
                  value={answers[currentQuestion] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
                >
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-secondary/50 cursor-pointer"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === 'true-false' && (
                <RadioGroup
                  value={answers[currentQuestion] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
                >
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <div
                        key={option}
                        className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-secondary/50 cursor-pointer"
                      >
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === 'short-answer' && (
                <Input
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                  placeholder="Type your answer here..."
                  className="text-lg"
                />
              )}

              {question.type === 'essay' && (
                <Textarea
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                  placeholder="Type your essay here..."
                  rows={8}
                  className="text-lg"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answeredCount} of {attemptData.quiz.questions.length} answered
            </div>

            {currentQuestion < attemptData.quiz.questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(attemptData.quiz.questions.length - 1, prev + 1)
                  )
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitDialog(true)}>
                <Send className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-6 flex flex-wrap gap-2">
            {attemptData.quiz.questions.map((_: any, index: number) => (
              <Button
                key={index}
                variant={currentQuestion === index ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuestion(index)}
                className={
                  answers[index]
                    ? 'border-green-500'
                    : currentQuestion === index
                    ? ''
                    : 'border-muted'
                }
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < attemptData.quiz.questions.length && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    You have answered {answeredCount} out of {attemptData.quiz.questions.length}{' '}
                    questions. Unanswered questions will be marked as incorrect.
                  </div>
                </div>
              )}
              Are you sure you want to submit your quiz? You cannot change your answers after
              submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
