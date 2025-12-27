# AI Assessment Platform Integration Plan

## Overview
Integrate the AI Assessment Platform into UniEd's student dashboard as a new feature.

## Integration Steps

### Phase 1: Frontend Integration
1. **Copy AI Assessment Components** to `frontend/src/components/ai-assessment/`
   - QuestionCard.tsx
   - QuestionSidebar.tsx
   - WaveformVisualizer.tsx
   - TranscriptBox.tsx
   - FeedbackOverlay.tsx
   - TopicSelector.tsx
   - Header.tsx
   - ProgressRing.tsx

2. **Copy Custom Hooks** to `frontend/src/hooks/`
   - useAssessment.ts
   - useSpeechRecognition.ts

3. **Create New Page** `frontend/src/components/dashboard/AIAssessmentPage.tsx`
   - Adapt Index.tsx from AI platform
   - Apply UniEd's cyan/blue color template
   - Make fully responsive for mobile

4. **Update Navigation**
   - Add "AI Assessment" to student dashboard sidebar
   - Add route in Dashboard.tsx
   - Add icon (Brain or Sparkles)

### Phase 2: Styling Updates
1. **Color Template Changes**
   - Replace purple/indigo with cyan/blue gradients
   - Update button styles to match UniEd theme
   - Update card backgrounds and borders
   - Apply consistent spacing and typography

2. **Responsive Design**
   - Ensure mobile-first approach
   - Collapsible sidebar on mobile
   - Stack components vertically on small screens
   - Touch-friendly buttons and controls

### Phase 3: Backend Integration
1. **API Configuration**
   - Add AI backend URL to frontend .env
   - Create API service file for AI endpoints
   - Handle authentication/authorization

2. **Backend Setup** (Optional - if hosting separately)
   - Deploy Python FastAPI backend
   - Configure OpenAI and ElevenLabs API keys
   - Set up CORS for UniEd frontend

### Phase 4: Features to Implement
1. **Core Features**
   - ✅ Adaptive difficulty assessment
   - ✅ Voice input with speech recognition
   - ✅ AI-powered evaluation
   - ✅ Real-time feedback
   - ✅ Progress tracking
   - ✅ Custom voice feedback (ElevenLabs)

2. **UniEd-Specific Features**
   - Link assessments to courses
   - Save assessment results to student profile
   - Faculty can view student assessment performance
   - Integration with grades system
   - Assessment history and analytics

### Phase 5: Testing
1. Test speech recognition in different browsers
2. Test responsive design on mobile devices
3. Test API integration
4. Test error handling and edge cases

## File Structure After Integration

```
frontend/src/
├── components/
│   ├── ai-assessment/          # NEW
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionSidebar.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   ├── TranscriptBox.tsx
│   │   ├── FeedbackOverlay.tsx
│   │   ├── TopicSelector.tsx
│   │   ├── Header.tsx
│   │   └── ProgressRing.tsx
│   └── dashboard/
│       ├── AIAssessmentPage.tsx  # NEW
│       └── ... (existing files)
├── hooks/
│   ├── useAssessment.ts         # NEW
│   ├── useSpeechRecognition.ts  # NEW
│   └── ... (existing hooks)
├── services/
│   └── aiAssessmentService.ts   # NEW
└── pages/
    └── Dashboard.tsx            # UPDATED
```

## API Endpoints Needed

### From AI Backend
- `POST /api/start-session` - Start assessment
- `GET /api/get-next-question` - Get next question
- `POST /api/submit-answer` - Submit and evaluate
- `POST /api/transcribe-audio` - Audio transcription
- `POST /api/generate-voice-feedback` - TTS feedback

### UniEd Backend (Optional Extensions)
- `POST /api/v1/student/assessments` - Save assessment result
- `GET /api/v1/student/assessments` - Get assessment history
- `GET /api/v1/student/assessments/:id` - Get specific assessment

## Environment Variables

### Frontend (.env)
```env
VITE_AI_ASSESSMENT_API_URL=http://localhost:8000/api
```

### AI Backend (.env)
```env
OPENAI_API_KEY=your_key
TTS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id
```

## Color Template Mapping

| AI Platform Color | UniEd Color |
|-------------------|-------------|
| Purple (#9333ea) | Cyan (#06b6d4) |
| Indigo (#6366f1) | Blue (#3b82f6) |
| Purple gradient | Cyan-Blue gradient |

## Next Steps

1. ✅ Create integration plan
2. ⏳ Copy and adapt components
3. ⏳ Update styling to match UniEd
4. ⏳ Add to dashboard navigation
5. ⏳ Test integration
6. ⏳ Deploy and document
