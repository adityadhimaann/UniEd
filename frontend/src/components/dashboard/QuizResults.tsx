import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quiz } from '@/services/quizService';

interface QuizResultsProps {
  results: any;
  quiz: Quiz;
  onClose: () => void;
}

export function QuizResults({ results, quiz, onClose }: QuizResultsProps) {
  const { attempt, gradedAnswers, passed } = results;
  const percentage = attempt.percentage;
  const score = attempt.score;
  const totalPoints = quiz.totalPoints;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              {passed ? (
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl">
              {passed ? 'Congratulations!' : 'Quiz Completed'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {passed
                ? `You passed with ${percentage}%!`
                : `You scored ${percentage}%. Passing score is ${quiz.passingScore}%`}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Score</span>
                <span className="font-semibold">
                  {score} / {totalPoints} points
                </span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">
                  {gradedAnswers?.filter((a: any) => a.isCorrect).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">
                  {gradedAnswers?.filter((a: any) => !a.isCorrect).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Clock className="w-5 h-5" />
                  {Math.floor(attempt.timeSpent / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              {passed ? (
                <Badge className="bg-green-500 text-lg px-6 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Passed
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg px-6 py-2">
                  <XCircle className="w-4 h-4 mr-2" />
                  Not Passed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Results */}
      {quiz.showCorrectAnswers && gradedAnswers && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Detailed Results</h2>
          {quiz.questions.map((question: any, index: number) => {
            const answer = gradedAnswers[index];
            const isCorrect = answer?.isCorrect;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={isCorrect ? 'border-green-500' : 'border-red-500'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        Question {index + 1}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({question.points} points)
                        </span>
                      </CardTitle>
                      {isCorrect ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Incorrect
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium">{question.question}</p>

                    {/* Your Answer */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                      <p
                        className={`font-medium ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {answer?.answer || 'Not answered'}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    {!isCorrect && question.correctAnswer && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                        <p className="font-medium text-green-600">{question.correctAnswer}</p>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium mb-1">Explanation:</p>
                        <p className="text-sm">{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button onClick={onClose} className="flex-1">
              Back to Quizzes
            </Button>
            {!passed && quiz.attemptsRemaining && quiz.attemptsRemaining > 0 && (
              <Button variant="outline" className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
