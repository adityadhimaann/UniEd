# AI Assessment Integration - Step-by-Step Guide

## Overview
This guide will help you integrate the AI Assessment Platform into your UniEd student dashboard.

## Prerequisites
- AI Assessment backend deployed and running (Python FastAPI)
- Backend URL available
- OpenAI and ElevenLabs API keys configured in AI backend

---

## Step 1: Add Environment Variable

Add to `frontend/.env`:
```env
VITE_AI_ASSESSMENT_API_URL=http://localhost:8000/api
# Or your deployed backend URL:
# VITE_AI_ASSESSMENT_API_URL=https://your-ai-backend.onrender.com/api
```

---

## Step 2: Create AI Assessment Service

Create `frontend/src/services/aiAssessmentService.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_AI_ASSESSMENT_API_URL || 'http://localhost:8000/api';

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
```

---

## Step 3: Copy Custom Hooks

### Create `frontend/src/hooks/useAssessment.ts`
Copy the content from `ai-assessment-temp/aifrontend/src/hooks/useAssessment.ts` but update the import:
- Change `import { apiClient } from "@/lib/api-client"` to `import aiAssessmentService from '@/services/aiAssessmentService'`
- Replace all `apiClient.` calls with `aiAssessmentService.`

### Create `frontend/src/hooks/useSpeechRecognition.ts`
Copy the content from `ai-assessment-temp/aifrontend/src/hooks/useSpeechRecognition.ts` with same import updates.

---

## Step 4: Create AI Assessment Components

Create directory: `frontend/src/components/ai-assessment/`

### 1. QuestionCard.tsx (with cyan/blue theme)
```typescript
import { HelpCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  className?: string;
}

export function QuestionCard({ questionNumber, question, className }: QuestionCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs text-cyan-500 uppercase tracking-wider mb-2 font-medium">
            Question {questionNumber}
          </p>
          <h2 className="text-xl font-semibold leading-relaxed">
            {question}
          </h2>
        </div>
      </div>
    </div>
  );
}
```

### 2. TopicSelector.tsx (with cyan/blue theme)
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface TopicSelectorProps {
  onStart: (topic: string, difficulty: Difficulty) => void;
  isLoading: boolean;
}

const topics = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "Cybersecurity",
  "Cloud Computing",
];

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Basic concepts" },
  { value: "medium", label: "Medium", description: "Application & analysis" },
  { value: "hard", label: "Hard", description: "Complex problem solving" },
];

export function TopicSelector({ onStart, isLoading }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState("Artificial Intelligence");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium");

  const handleStart = () => {
    const topic = customTopic.trim() || selectedTopic;
    onStart(topic, selectedDifficulty);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full space-y-8 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            AI Assessment
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-powered adaptive questions
          </p>
        </div>

        {/* Topic Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Select Topic</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic("");
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  selectedTopic === topic && !customTopic
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-500"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <Input
            placeholder="Enter custom topic..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="bg-secondary/30"
          />
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Starting Difficulty</Label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                  selectedDifficulty === diff.value
                    ? "bg-cyan-500/20 border-cyan-500"
                    : "bg-secondary/30 border-border"
                }`}
              >
                <Badge className="mb-2">{diff.label}</Badge>
                <p className="text-xs text-muted-foreground">{diff.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Generating Question...
            </>
          ) : (
            <>
              Start Assessment
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          The AI will adapt difficulty based on your performance
        </p>
      </div>
    </div>
  );
}
```

### 3. WaveformVisualizer.tsx
### 4. TranscriptBox.tsx
### 5. QuestionSidebar.tsx
### 6. FeedbackOverlay.tsx

(Copy these from the ai-assessment-temp folder and update colors from purple/indigo to cyan/blue)

---

## Step 5: Create Main AI Assessment Page

Create `frontend/src/components/dashboard/AIAssessmentPage.tsx`:

```typescript
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
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              AI Assessment
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {topic} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • Question {currentQuestionIndex + 1}/10
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <QuestionSidebar
            questions={sidebarQuestions}
            currentQuestionIndex={currentQuestionIndex}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onSelect={(index) => {}}
          />

          {/* Assessment Area */}
          <main className="flex-1 space-y-6">
            {currentQuestion && (
              <QuestionCard
                questionNumber={currentQuestionIndex + 1}
                question={currentQuestion.question}
              />
            )}

            {/* Voice Input & Transcript */}
            <div className="grid md:grid-cols-2 gap-6">
              <WaveformVisualizer isActive={isListening} />
              <TranscriptBox transcript={transcript} isActive={isListening} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={toggleRecording}
                className={`min-w-[160px] ${!isListening && 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'}`}
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
                  className="min-w-[160px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
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
```

---

## Step 6: Add to Dashboard Navigation

Update `frontend/src/pages/Dashboard.tsx`:

1. Add import:
```typescript
import AIAssessmentPage from "@/components/dashboard/AIAssessmentPage";
import { Brain } from "lucide-react";
```

2. Add to `studentNavItems`:
```typescript
const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
  { icon: FileText, label: "Assignments", path: "/dashboard/assignments" },
  { icon: Brain, label: "AI Assessment", path: "/dashboard/ai-assessment" }, // NEW
  { icon: TrendingUp, label: "Grades", path: "/dashboard/grades" },
  // ... rest of items
];
```

3. Add route:
```typescript
<Routes>
  <Route index element={<DashboardHome />} />
  <Route path="courses" element={<CoursesPage />} />
  <Route path="ai-assessment" element={<AIAssessmentPage />} /> {/* NEW */}
  {/* ... rest of routes */}
</Routes>
```

---

## Step 7: Deploy AI Backend

### Option A: Deploy to Render
1. Create new Web Service on Render
2. Connect your ai-assessment-platform repository
3. Set build command: `cd aibackend && pip install -r requirements.txt`
4. Set start command: `cd aibackend && python main.py`
5. Add environment variables:
   - `OPENAI_API_KEY`
   - `TTS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
   - `ELEVENLABS_MODEL_ID=eleven_turbo_v2`

### Option B: Deploy to Railway
Similar steps, Railway auto-detects Python apps

### Option C: Local Development
```bash
cd ai-assessment-temp/aibackend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Add .env file with API keys
python main.py
```

---

## Step 8: Test Integration

1. Start your UniEd frontend
2. Login as a student
3. Navigate to "AI Assessment" in sidebar
4. Select a topic and difficulty
5. Test voice recording and submission
6. Verify AI evaluation and feedback

---

## Troubleshooting

### CORS Issues
If you get CORS errors, update AI backend `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://uniedplatform.vercel.app", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Speech Recognition Not Working
- Only works in Chrome/Edge
- Requires HTTPS in production
- Check browser permissions for microphone

### API Connection Issues
- Verify `VITE_AI_ASSESSMENT_API_URL` is correct
- Check AI backend is running
- Check network tab for error details

---

## Next Steps

1. ✅ Copy all component files
2. ✅ Update colors to cyan/blue
3. ✅ Add to dashboard navigation
4. ✅ Deploy AI backend
5. ⏳ Test end-to-end
6. ⏳ Add assessment history feature
7. ⏳ Link to courses
8. ⏳ Faculty view of student assessments

---

## Files Checklist

- [ ] `frontend/.env` - Add AI_ASSESSMENT_API_URL
- [ ] `frontend/src/services/aiAssessmentService.ts`
- [ ] `frontend/src/hooks/useAssessment.ts`
- [ ] `frontend/src/hooks/useSpeechRecognition.ts`
- [ ] `frontend/src/components/ai-assessment/QuestionCard.tsx`
- [ ] `frontend/src/components/ai-assessment/TopicSelector.tsx`
- [ ] `frontend/src/components/ai-assessment/WaveformVisualizer.tsx`
- [ ] `frontend/src/components/ai-assessment/TranscriptBox.tsx`
- [ ] `frontend/src/components/ai-assessment/QuestionSidebar.tsx`
- [ ] `frontend/src/components/ai-assessment/FeedbackOverlay.tsx`
- [ ] `frontend/src/components/dashboard/AIAssessmentPage.tsx`
- [ ] `frontend/src/pages/Dashboard.tsx` - Updated with route

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for API calls
3. Verify AI backend logs
4. Test API endpoints directly using Postman

Good luck with the integration! 🚀
