import { useState, useCallback, useEffect } from "react";
import { QuestionSidebar } from "@/components/ai-assessment/QuestionSidebar";
import { QuestionCard } from "@/components/ai-assessment/QuestionCard";
import { WaveformVisualizer } from "@/components/ai-assessment/WaveformVisualizer";
import { TranscriptBox } from "@/components/ai-assessment/TranscriptBox";
import { FeedbackOverlay } from "@/components/ai-assessment/FeedbackOverlay";
import { TopicSelector } from "@/components/ai-assessment/TopicSelector";
import { LisaIntro } from "@/components/ai-assessment/LisaIntro";
import { Button } from "@/components/ui/button";
import { Mic, Send, Loader2, MicOff, RotateCcw } from "lucide-react";
import { useAssessment, type Difficulty } from "@/hooks/useAssessment";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";
import lisaGif from "@/assets/lisa.gif";
import lisaPng from "@/assets/lisa.png";

const LISA_INTRO_KEY = "lisa_intro_shown";

export default function AIAssessmentPage() {
  const [showIntro, setShowIntro] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Check if intro has been shown in this session
  useEffect(() => {
    const introShown = sessionStorage.getItem(LISA_INTRO_KEY);
    if (!introShown) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(LISA_INTRO_KEY, "true");
    setShowIntro(false);
  }, []);

  const {
    topic,
    setTopic,
    difficulty,
    questions,
    currentQuestionIndex,
    currentQuestion,
    isLoading,
    isEvaluating,
    evaluation,
    startAssessment,
    submitAnswer,
    nextQuestion,
    resetAssessment,
  } = useAssessment();

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const handleStart = useCallback(async (selectedTopic: string, selectedDifficulty: Difficulty) => {
    setTopic(selectedTopic);
    setHasStarted(true);
    await startAssessment();
  }, [setTopic, startAssessment]);

  const toggleRecording = useCallback(() => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isSupported, startListening, stopListening]);

  const handleSubmit = useCallback(async () => {
    if (!transcript.trim()) {
      toast.error("Please record your answer before submitting.");
      return;
    }
    stopListening();
    await submitAnswer(transcript);
  }, [transcript, stopListening, submitAnswer]);

  const handleNextQuestion = useCallback(async () => {
    resetTranscript();
    await nextQuestion();
  }, [resetTranscript, nextQuestion]);

  const handleReset = useCallback(() => {
    resetAssessment();
    resetTranscript();
    setHasStarted(false);
  }, [resetAssessment, resetTranscript]);

  const sidebarQuestions = questions.map((q) => ({
    id: q.id,
    title: q.title,
    isCorrect: q.isCorrect,
  }));

  // Show intro animation first
  if (showIntro) {
    return <LisaIntro onComplete={handleIntroComplete} />;
  }

  if (!hasStarted) {
    return <TopicSelector onStart={handleStart} isLoading={isLoading} />;
  }

  if (isLoading && !currentQuestion) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src={lisaGif} alt="Lisa Loading" className="h-24 w-24 md:h-32 md:w-32 mx-auto mix-blend-screen" />
          <p className="text-muted-foreground">Lisa is generating your first question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 pt-32 md:pt-40">
      {/* Sidebar - compact width */}
      <div className="w-[220px] bg-slate-900/50 border-r border-slate-700/50 flex-shrink-0">
        <div className="h-full p-4">
          <QuestionSidebar
            questions={sidebarQuestions}
            currentQuestionIndex={currentQuestionIndex}
            isCollapsed={false}
            onToggle={() => {}}
            onSelect={(index) => {}}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src={lisaPng} alt="Lisa AI" className="h-12 w-12 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white">LISA AI ASSESSMENT</h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span>TOPIC: <span className="text-cyan-400">{topic}</span></span>
                <span>DIFFICULTY: <span className="text-cyan-400">{difficulty.toUpperCase()}</span></span>
                <span>PROGRESS: <span className="text-cyan-400">{currentQuestionIndex + 1}/10</span></span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="flex-shrink-0">
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              question={currentQuestion.question}
            />
          </div>
        )}

        {/* Voice Input & Transcript Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <WaveformVisualizer isActive={isListening} />
          <TranscriptBox transcript={transcript} isActive={isListening} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-shrink-0">
          <Button
            size="lg"
            onClick={toggleRecording}
            className={`min-w-[180px] ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-cyan-500 hover:bg-cyan-600'
            } text-white`}
            disabled={isEvaluating || !isSupported}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          {transcript && (
            <Button
              size="lg"
              onClick={handleSubmit}
              className="min-w-[180px] bg-cyan-500 hover:bg-cyan-600 text-white"
              disabled={isEvaluating}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          )}
        </div>

        {!isSupported && (
          <p className="text-center text-sm text-red-400">
            Speech recognition is not supported in your browser. Please use Chrome.
          </p>
        )}
      </div>

      {/* Feedback Overlay */}
      {evaluation && (
        <FeedbackOverlay
          isVisible={!!evaluation}
          isCorrect={evaluation.is_correct}
          suggestions={evaluation.feedback}
          onClose={() => {}}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
}
