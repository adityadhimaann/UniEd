import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseAssessmentService, UserStats } from "@/services/firebaseAssessmentService";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Target, Award } from "lucide-react";

export function UserStatsCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const userStats = await firebaseAssessmentService.getUserStats(user!.id);
      setStats(userStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading || !stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.completedAssessments}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{Math.round(stats.averageScore * 10)}%</p>
            <p className="text-xs text-slate-400">Avg Score</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatTime(stats.totalTimeSpent)}</p>
            <p className="text-xs text-slate-400">Time Spent</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{Object.keys(stats.topicStats || {}).length}</p>
            <p className="text-xs text-slate-400">Topics</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
