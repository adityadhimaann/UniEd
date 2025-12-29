import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';

export interface AssessmentSession {
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
  timeSpent: number; // in seconds
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  userAnswer: string;
  isCorrect: boolean | null;
  feedback: string;
  timeSpent: number;
}

export interface UserStats {
  userId: string;
  userName: string;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalTimeSpent: number;
  topicStats: Record<string, {
    count: number;
    averageScore: number;
    bestScore: number;
  }>;
  lastAssessmentDate: Timestamp;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  topic: string;
  difficulty: string;
  completedAt: Timestamp;
  timeSpent: number;
}

class FirebaseAssessmentService {
  private checkFirebase() {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase is not configured. Please add Firebase credentials to .env.local');
    }
  }

  // Save or update assessment session
  async saveSession(session: Omit<AssessmentSession, 'id'>): Promise<string> {
    this.checkFirebase();
    const sessionId = `${session.userId}_${Date.now()}`;
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    
    await setDoc(sessionRef, {
      ...session,
      startedAt: serverTimestamp(),
    });
    
    return sessionId;
  }

  // Update existing session
  async updateSession(sessionId: string, updates: Partial<AssessmentSession>): Promise<void> {
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    await updateDoc(sessionRef, updates);
  }

  // Complete assessment session
  async completeSession(sessionId: string, finalScore: number, timeSpent: number): Promise<void> {
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'completed',
      score: finalScore,
      timeSpent,
      completedAt: serverTimestamp(),
    });
  }

  // Get user's assessment history
  async getUserHistory(userId: string, limitCount: number = 10): Promise<AssessmentSession[]> {
    const sessionsRef = collection(db, 'assessmentSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('startedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentSession));
  }

  // Get specific session
  async getSession(sessionId: string): Promise<AssessmentSession | null> {
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    const snapshot = await getDoc(sessionRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AssessmentSession;
    }
    return null;
  }

  // Get incomplete sessions for user
  async getIncompleteSessions(userId: string): Promise<AssessmentSession[]> {
    const sessionsRef = collection(db, 'assessmentSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('status', '==', 'in-progress'),
      orderBy('startedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentSession));
  }

  // Update user statistics
  async updateUserStats(userId: string, userName: string, session: AssessmentSession): Promise<void> {
    const statsRef = doc(db, 'userStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const currentStats = statsSnap.data() as UserStats;
      const topicStats = currentStats.topicStats || {};
      
      // Update topic-specific stats
      if (!topicStats[session.topic]) {
        topicStats[session.topic] = {
          count: 0,
          averageScore: 0,
          bestScore: 0,
        };
      }
      
      const topicStat = topicStats[session.topic];
      topicStat.count += 1;
      topicStat.averageScore = 
        (topicStat.averageScore * (topicStat.count - 1) + session.score) / topicStat.count;
      topicStat.bestScore = Math.max(topicStat.bestScore, session.score);
      
      // Update overall stats
      const newCompletedCount = currentStats.completedAssessments + 1;
      const newAverageScore = 
        (currentStats.averageScore * currentStats.completedAssessments + session.score) / newCompletedCount;
      
      await updateDoc(statsRef, {
        totalAssessments: currentStats.totalAssessments + 1,
        completedAssessments: newCompletedCount,
        averageScore: newAverageScore,
        totalTimeSpent: currentStats.totalTimeSpent + session.timeSpent,
        topicStats,
        lastAssessmentDate: serverTimestamp(),
      });
    } else {
      // Create new stats
      await setDoc(statsRef, {
        userId,
        userName,
        totalAssessments: 1,
        completedAssessments: 1,
        averageScore: session.score,
        totalTimeSpent: session.timeSpent,
        topicStats: {
          [session.topic]: {
            count: 1,
            averageScore: session.score,
            bestScore: session.score,
          },
        },
        lastAssessmentDate: serverTimestamp(),
      });
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats | null> {
    const statsRef = doc(db, 'userStats', userId);
    const snapshot = await getDoc(statsRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as UserStats;
    }
    return null;
  }

  // Get global leaderboard
  async getGlobalLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      orderBy('score', 'desc'),
      orderBy('timeSpent', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  }

  // Get topic-specific leaderboard
  async getTopicLeaderboard(topic: string, limitCount: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('topic', '==', topic),
      orderBy('score', 'desc'),
      orderBy('timeSpent', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  }

  // Add entry to leaderboard
  async addToLeaderboard(entry: LeaderboardEntry): Promise<void> {
    const leaderboardRef = doc(db, 'leaderboard', `${entry.userId}_${Date.now()}`);
    await setDoc(leaderboardRef, {
      ...entry,
      completedAt: serverTimestamp(),
    });
  }

  // Get user's rank in leaderboard
  async getUserRank(userId: string, topic?: string): Promise<number> {
    const leaderboardRef = collection(db, 'leaderboard');
    let q;
    
    if (topic) {
      q = query(
        leaderboardRef,
        where('topic', '==', topic),
        orderBy('score', 'desc'),
        orderBy('timeSpent', 'asc')
      );
    } else {
      q = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        orderBy('timeSpent', 'asc')
      );
    }
    
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    
    const userIndex = entries.findIndex(entry => entry.userId === userId);
    return userIndex >= 0 ? userIndex + 1 : -1;
  }
}

export const firebaseAssessmentService = new FirebaseAssessmentService();
