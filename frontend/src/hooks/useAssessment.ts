import { useState, useCallback, useRef } from "react";
import aiAssessmentService, { Difficulty as APIDifficulty } from "@/services/aiAssessmentService";
import { toast } from "sonner";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  title: string;
  question: string;
  concept: string;
  expectedPoints: string[];
  isCorrect: boolean | null;
  score?: number;
}

export interface Evaluation {
  score: number;
  is_correct: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface UseAssessmentReturn {
  topic: string;
  setTopic: (topic: string) => void;
  difficulty: Difficulty;
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  isLoading: boolean;
  isEvaluating: boolean;
  evaluation: Evaluation | null;
  consecutiveHighScores: number;
  consecutiveLowScores: number;
  sessionId: string | null;
  startAssessment: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  resetAssessment: () => void;
}

function toBackendDifficulty(difficulty: Difficulty): APIDifficulty {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1) as APIDifficulty;
}

function toFrontendDifficulty(difficulty: APIDifficulty): Difficulty {
  return difficulty.toLowerCase() as Difficulty;
}

export function useAssessment(): UseAssessmentReturn {
  const [topic, setTopic] = useState("Artificial Intelligence");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [consecutiveHighScores, setConsecutiveHighScores] = useState(0);
  const [consecutiveLowScores, setConsecutiveLowScores] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const currentQuestionIdRef = useRef<string | null>(null);

  const startAssessment = useCallback(async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setEvaluation(null);
    setConsecutiveHighScores(0);
    setConsecutiveLowScores(0);
    currentQuestionIdRef.current = null;

    try {
      const response = await aiAssessmentService.startSession({
        topic,
        initial_difficulty: toBackendDifficulty(difficulty),
      });

      setSessionId(response.session_id);

      const questionResponse = await aiAssessmentService.getNextQuestion(response.session_id);
      
      currentQuestionIdRef.current = questionResponse.question_id;

      const question: Question = {
        id: questionResponse.question_id,
        title: `Question 1`,
        question: questionResponse.question_text,
        concept: topic,
        expectedPoints: [],
        isCorrect: null,
      };

      setQuestions([question]);
    } catch (error) {
      console.error("Error starting assessment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty]);

  const adjustDifficulty = useCallback((score: number, newDifficulty: APIDifficulty) => {
    let newHighScores = consecutiveHighScores;
    let newLowScores = consecutiveLowScores;

    if (score >= 80) {
      newHighScores += 1;
      newLowScores = 0;
    } else if (score < 80) {
      newLowScores += 1;
      newHighScores = 0;
    }

    setConsecutiveHighScores(newHighScores);
    setConsecutiveLowScores(newLowScores);
    
    const frontendDifficulty = toFrontendDifficulty(newDifficulty);
    if (frontendDifficulty !== difficulty) {
      setDifficulty(frontendDifficulty);
      toast.success(`Difficulty changed to ${frontendDifficulty.charAt(0).toUpperCase() + frontendDifficulty.slice(1)}!`);
    }
  }, [difficulty, consecutiveHighScores, consecutiveLowScores]);

  const submitAnswer = useCallback(async (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ || !answer.trim() || !sessionId || !currentQuestionIdRef.current) return;

    setIsEvaluating(true);
    try {
      const response = await aiAssessmentService.submitAnswer({
        session_id: sessionId,
        question_id: currentQuestionIdRef.current,
        answer_text: answer,
      });

      const evalResult: Evaluation = {
        score: response.score,
        is_correct: response.is_correct,
        feedback: response.feedback_text,
        strengths: [],
        improvements: [],
      };

      setEvaluation(evalResult);

      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentQuestionIndex
            ? { ...q, isCorrect: evalResult.is_correct, score: evalResult.score }
            : q
        )
      );

      adjustDifficulty(evalResult.score, response.new_difficulty);

      try {
        const audioBlob = await aiAssessmentService.generateVoiceFeedback({
          feedback_text: evalResult.feedback,
        });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } catch (audioError) {
        console.error("Error playing voice feedback:", audioError);
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(evalResult.feedback);
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to evaluate answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  }, [questions, currentQuestionIndex, sessionId, adjustDifficulty]);

  const nextQuestion = useCallback(async () => {
    if (!sessionId) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    setEvaluation(null);
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= 10) {
      toast.success("Assessment Complete! You've answered all questions.");
      return;
    }

    setIsLoading(true);
    try {
      const questionResponse = await aiAssessmentService.getNextQuestion(sessionId);
      
      currentQuestionIdRef.current = questionResponse.question_id;

      const nextQ: Question = {
        id: questionResponse.question_id,
        title: `Question ${nextIndex + 1}`,
        question: questionResponse.question_text,
        concept: topic,
        expectedPoints: [],
        isCorrect: null,
      };

      setQuestions((prev) => [...prev, nextQ]);
      setCurrentQuestionIndex(nextIndex);
    } catch (error) {
      console.error("Error getting next question:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get next question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestionIndex, sessionId, topic]);

  const resetAssessment = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setEvaluation(null);
    setConsecutiveHighScores(0);
    setConsecutiveLowScores(0);
    setDifficulty("medium");
    setSessionId(null);
    currentQuestionIdRef.current = null;
  }, []);

  return {
    topic,
    setTopic,
    difficulty,
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex] || null,
    isLoading,
    isEvaluating,
    evaluation,
    consecutiveHighScores,
    consecutiveLowScores,
    sessionId,
    startAssessment,
    submitAnswer,
    nextQuestion,
    resetAssessment,
  };
}
