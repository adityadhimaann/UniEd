import { useState, useCallback, useEffect } from "react";
import { QuestionSidebar } from "@/components/ai-assessment/QuestionSidebar";
import { QuestionCard } from "@/components/ai-assessment/QuestionCard";
import { WaveformVisualizer } from "@/components/ai-assessment/WaveformVisualizer";
import { TranscriptBox } from "@/components/ai-assessment/TranscriptBox";
import { FeedbackOverlay } from "@/components/ai-assessment/FeedbackOverlay";
import { TopicSelector } from "@/components/ai-assessment/TopicSelector";
import { LisaIntro } from "@/components/ai-assessment/LisaIntro";
import { Button } from "@/components/ui/button";
import { Mic, Send, Loader2, MicOff, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAssessment, type Difficulty } from "@/hooks/useAssessment";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";
import lisaGif from "@/assets/lisa.gif";
import lisaPng from "@/assets/lisa.png";

const LISA_INTRO_KEY = "lisa_intro_shown";

export default function AIAssessmentPage() {
  const [showIntro, setShowIntro] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
    <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 pt-16 md:pt-20">
      {/* Sidebar - compact width on desktop, hidden or overlay on mobile */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 
        w-[240px] bg-slate-900/95 md:bg-slate-900/50 
        border-r border-slate-700/50 flex-shrink-0 
        transition-transform duration-300 ease-in-out
        ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-0 md:invisible' : 'translate-x-0 md:w-[220px]'}
        ${!sidebarCollapsed && 'shadow-2xl md:shadow-none'}
      `}>
        <div className="h-full p-4">
          <QuestionSidebar
            questions={sidebarQuestions}
            currentQuestionIndex={currentQuestionIndex}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onSelect={(index) => {}}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden relative">
        {/* Toggle Button for Mobile/Desktop Sidebar */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 left-2 md:top-4 md:left-4 z-[60] bg-slate-800/50 border-slate-700 md:flex h-8 w-8"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between flex-shrink-0 gap-4 md:pl-10">
          <div className="flex items-center gap-4">
            <img src={lisaPng} alt="Lisa AI" className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white uppercase">Lisa AI Assessment</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs text-slate-400 mt-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          <WaveformVisualizer isActive={isListening} />
          <TranscriptBox transcript={transcript} isActive={isListening} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-shrink-0 pb-4 md:pb-0">
          <Button
            size="lg"
            onClick={toggleRecording}
            className={`w-full sm:min-w-[180px] ${
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
              className="w-full sm:min-w-[180px] bg-cyan-500 hover:bg-cyan-600 text-white"
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
          <p className="text-center text-xs md:text-sm text-red-400">
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
