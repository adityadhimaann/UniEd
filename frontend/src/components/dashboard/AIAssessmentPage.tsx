import { useState, useCallback } from "react";
import { QuestionSidebar } from "@/components/ai-assessment/QuestionSidebar";
import { QuestionCard } from "@/components/ai-assessment/QuestionCard";
import { WaveformVisualizer } from "@/components/ai-assessment/WaveformVisualizer";
import { TranscriptBox } from "@/components/ai-assessment/TranscriptBox";
import { FeedbackOverlay } from "@/components/ai-assessment/FeedbackOverlay";
import { TopicSelector } from "@/components/ai-assessment/TopicSelector";
import { Button } from "@/components/ui/button";
import { Mic, Send, Loader2, MicOff, RotateCcw } from "lucide-react";
import { useAssessment, type Difficulty } from "@/hooks/useAssessment";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";

export default function AIAssessmentPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

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

  if (!hasStarted) {
    return <TopicSelector onStart={handleStart} isLoading={isLoading} />;
  }

  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
          <p className="text-muted-foreground">Generating your first question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              AI Assessment
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              {topic} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • Question {currentQuestionIndex + 1}/10
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <QuestionSidebar
              questions={sidebarQuestions}
              currentQuestionIndex={currentQuestionIndex}
              isCollapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              onSelect={(index) => {}}
            />
          </div>

          {/* Assessment Area */}
          <main className="flex-1 space-y-4 md:space-y-6">
            {currentQuestion && (
              <QuestionCard
                questionNumber={currentQuestionIndex + 1}
                question={currentQuestion.question}
              />
            )}

            {/* Voice Input & Transcript */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <WaveformVisualizer isActive={isListening} />
              <TranscriptBox transcript={transcript} isActive={isListening} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={toggleRecording}
                className={`w-full sm:min-w-[160px] ${!isListening && 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'}`}
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
                  variant="default"
                  size="lg"
                  onClick={handleSubmit}
                  className="w-full sm:min-w-[160px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
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
              <p className="text-center text-sm text-destructive">
                Speech recognition is not supported in your browser. Please use Chrome.
              </p>
            )}
          </main>
        </div>
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
