# Firebase Integration for Lisa AI Assessment Platform

## Overview
This document outlines the Firebase integration for the Lisa AI assessment platform, providing real-time data persistence, user analytics, leaderboards, and social features.

## Features Implemented

### 1. User Authentication & Profiles ✅
- **User Session Tracking**: Track user assessment sessions with Firebase Authentication
- **Profile Management**: Store user preferences and assessment history
- **Progress Tracking**: Monitor user improvement over time

### 2. Session Persistence ✅
- **Auto-Save**: Automatically save assessment progress to Firestore
- **Resume Capability**: Resume incomplete assessments from any device
- **Cross-Device Sync**: Access assessment history from multiple devices
- **Real-time Updates**: Live synchronization of assessment data

### 3. Leaderboards & Analytics ✅
- **Global Leaderboard**: Compete with users worldwide
- **Topic-Based Leaderboards**: Compare scores within specific topics
- **Performance Metrics**: Track scores, time spent, and accuracy
- **Ranking System**: Real-time rank calculation and updates

### 4. Assessment History ✅
- **Complete History**: Store all past assessments with full details
- **Question Review**: Review previous questions and answers
- **Performance Trends**: Track improvement over time
- **Export Capability**: Export results for external analysis

### 5. User Statistics ✅
- **Comprehensive Stats**: Total assessments, average scores, time spent
- **Topic Breakdown**: Performance metrics per topic
- **Best Scores**: Track personal bests for each topic
- **Activity Timeline**: View assessment activity over time

### 6. Social Features (Ready for Implementation)
- **Share Results**: Share assessment scores with friends
- **Challenge System**: Challenge other users to beat your score
- **Study Groups**: Create and join study groups
- **Achievements**: Unlock badges and achievements

## Firebase Structure

### Collections

#### 1. `assessmentSessions`
```typescript
{
  id: string;
  userId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: AssessmentQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  status: 'in-progress' | 'completed';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  timeSpent: number;
}
```

#### 2. `userStats`
```typescript
{
  userId: string;
  userName: string;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalTimeSpent: number;
  topicStats: {
    [topic: string]: {
      count: number;
      averageScore: number;
      bestScore: number;
    }
  };
  lastAssessmentDate: Timestamp;
}
```

#### 3. `leaderboard`
```typescript
{
  userId: string;
  userName: string;
  score: number;
  topic: string;
  difficulty: string;
  completedAt: Timestamp;
  timeSpent: number;
}
```

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `unied-lisa-ai`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode**
4. Choose your region (closest to your users)
5. Click "Enable"

### 3. Configure Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assessment Sessions - users can only read/write their own
    match /assessmentSessions/{sessionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // User Stats - users can only read/write their own
    match /userStats/{userId} {
      allow read: if request.auth != null && userId == request.auth.uid;
      allow write: if request.auth != null && userId == request.auth.uid;
    }
    
    // Leaderboard - everyone can read, only authenticated users can write
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app with nickname: `UniEd Frontend`
5. Copy the configuration object

### 5. Update Environment Variables
Add to `frontend/.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Components Created

### 1. `AssessmentHistory.tsx`
Displays user's complete assessment history with:
- Topic and difficulty badges
- Score and completion status
- Time spent and date
- Resume capability for incomplete assessments

### 2. `Leaderboard.tsx`
Shows competitive rankings with:
- Global and topic-specific leaderboards
- Top 3 highlighted with special icons
- User avatars and scores
- Time-based sorting for ties

### 3. `UserStatsCard.tsx`
Dashboard widget showing:
- Total completed assessments
- Average score percentage
- Total time spent
- Number of topics attempted

## Service Methods

### FirebaseAssessmentService

#### Session Management
- `saveSession()` - Create new assessment session
- `updateSession()` - Update existing session
- `completeSession()` - Mark session as completed
- `getSession()` - Retrieve specific session
- `getUserHistory()` - Get user's assessment history
- `getIncompleteSessions()` - Find resumable sessions

#### Statistics
- `updateUserStats()` - Update user statistics after completion
- `getUserStats()` - Retrieve user statistics

#### Leaderboard
- `getGlobalLeaderboard()` - Get top performers globally
- `getTopicLeaderboard()` - Get top performers for specific topic
- `addToLeaderboard()` - Add new leaderboard entry
- `getUserRank()` - Get user's current rank

## Usage Examples

### Save Assessment Session
```typescript
import { firebaseAssessmentService } from '@/services/firebaseAssessmentService';

const sessionId = await firebaseAssessmentService.saveSession({
  userId: user.id,
  userName: user.name,
  topic: 'Artificial Intelligence',
  difficulty: 'medium',
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  totalQuestions: 10,
  status: 'in-progress',
  timeSpent: 0,
});
```

### Complete Assessment
```typescript
await firebaseAssessmentService.completeSession(sessionId, finalScore, timeSpent);
await firebaseAssessmentService.updateUserStats(userId, userName, session);
await firebaseAssessmentService.addToLeaderboard({
  userId,
  userName,
  score: finalScore,
  topic,
  difficulty,
  timeSpent,
});
```

### Load User History
```typescript
const history = await firebaseAssessmentService.getUserHistory(userId, 20);
```

## Integration with Existing Code

### Update `useAssessment.ts` Hook
Add Firebase persistence to the assessment hook:
```typescript
// Save session on start
const sessionId = await firebaseAssessmentService.saveSession({...});

// Update on each question
await firebaseAssessmentService.updateSession(sessionId, {
  currentQuestionIndex,
  questions: updatedQuestions,
});

// Complete on finish
await firebaseAssessmentService.completeSession(sessionId, score, timeSpent);
```

## Future Enhancements

### 1. Real-time Multiplayer
- Live competitions
- Real-time score updates
- Spectator mode

### 2. Advanced Analytics
- Performance heatmaps
- Difficulty progression
- Learning curve analysis
- Predictive scoring

### 3. Social Features
- Friend system
- Direct challenges
- Group competitions
- Social sharing

### 4. Gamification
- Achievement system
- Badges and rewards
- Streak tracking
- Daily challenges

### 5. AI-Powered Insights
- Personalized recommendations
- Weak area identification
- Study plan generation
- Performance predictions

## Security Considerations

1. **Authentication Required**: All write operations require authenticated users
2. **User Isolation**: Users can only access their own data
3. **Public Leaderboard**: Leaderboard is read-only for all users
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Data Validation**: Validate all data before writing to Firestore

## Performance Optimization

1. **Indexing**: Create composite indexes for common queries
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Cache frequently accessed data
4. **Batch Operations**: Use batch writes for multiple updates
5. **Offline Support**: Enable offline persistence for better UX

## Monitoring & Analytics

1. **Firebase Analytics**: Track user engagement and feature usage
2. **Performance Monitoring**: Monitor app performance and load times
3. **Crash Reporting**: Track and fix errors quickly
4. **Custom Events**: Track assessment completions, scores, etc.

## Cost Estimation

### Free Tier Limits
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited
- **Analytics**: Unlimited

### Estimated Usage (1000 active users/day)
- **Reads**: ~10K/day (well within free tier)
- **Writes**: ~5K/day (well within free tier)
- **Storage**: ~100MB (well within free tier)

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Console](https://console.firebase.google.com/)

## Conclusion

This Firebase integration provides a robust, scalable foundation for the Lisa AI assessment platform. It enables real-time data persistence, competitive features, and comprehensive analytics while maintaining security and performance.
