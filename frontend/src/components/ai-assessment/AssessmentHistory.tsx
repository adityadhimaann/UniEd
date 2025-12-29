import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseAssessmentService, AssessmentSession } from "@/services/firebaseAssessmentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Trophy, TrendingUp, History } from "lucide-react";
import { format } from "date-fns";

export function AssessmentHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const sessions = await firebaseAssessmentService.getUserHistory(user!.id, 20);
      setHistory(sessions);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <History className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-2" />
          <p className="text-slate-400">Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <History className="h-12 w-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">No assessment history yet</p>
          <p className="text-sm text-slate-500 mt-1">Complete your first assessment to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-cyan-400" />
          Assessment History
        </h2>
        <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
          {history.length} Total
        </Badge>
      </div>

      <div className="space-y-3">
        {history.map((session) => (
          <Card key={session.id} className="bg-slate-800/50 border-slate-700/50 p-4 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-medium">{session.topic}</h3>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      session.difficulty === 'easy' 
                        ? 'text-green-400 border-green-400/30' 
                        : session.difficulty === 'medium'
                        ? 'text-yellow-400 border-yellow-400/30'
                        : 'text-red-400 border-red-400/30'
                    }`}
                  >
                    {session.difficulty.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      session.status === 'completed'
                        ? 'text-cyan-400 border-cyan-400/30'
                        : 'text-orange-400 border-orange-400/30'
                    }`}
                  >
                    {session.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Score: {session.score}/{session.totalQuestions}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(session.timeSpent)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {session.completedAt 
                      ? format(session.completedAt.toDate(), 'MMM dd, yyyy')
                      : format(session.startedAt.toDate(), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-cyan-400">
                  {Math.round((session.score / session.totalQuestions) * 100)}%
                </div>
                {session.status === 'in-progress' && (
                  <Button size="sm" variant="outline" className="text-xs">
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
