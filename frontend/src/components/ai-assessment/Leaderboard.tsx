import { useEffect, useState } from "react";
import { firebaseAssessmentService, LeaderboardEntry } from "@/services/firebaseAssessmentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const topics = [
  "All Topics",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "Cybersecurity",
  "Cloud Computing",
];

export function Leaderboard() {
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTopic]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const entries = selectedTopic === "All Topics"
        ? await firebaseAssessmentService.getGlobalLeaderboard(50)
        : await firebaseAssessmentService.getTopicLeaderboard(selectedTopic, 50);
      setLeaderboard(entries);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-400" />;
      default:
        return <span className="text-slate-400 font-medium">#{rank}</span>;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-cyan-400" />
          Leaderboard
        </h2>
      </div>

      <Tabs value={selectedTopic} onValueChange={setSelectedTopic} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50 w-full justify-start overflow-x-auto flex-nowrap">
          {topics.map((topic) => (
            <TabsTrigger
              key={topic}
              value={topic}
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 whitespace-nowrap"
            >
              {topic}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTopic} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-2" />
                <p className="text-slate-400">Loading leaderboard...</p>
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No entries yet</p>
                <p className="text-sm text-slate-500 mt-1">Be the first to complete an assessment!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <Card
                  key={`${entry.userId}_${index}`}
                  className={`p-4 transition-all ${
                    index < 3
                      ? 'bg-gradient-to-r from-slate-800/80 to-slate-800/50 border-cyan-500/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(index + 1)}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                        {entry.userName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="text-white font-medium">{entry.userName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{entry.topic}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs border-slate-600">
                          {entry.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold text-lg">{entry.score}</p>
                        <p className="text-slate-500 text-xs">points</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(entry.timeSpent)}
                        </p>
                        <p className="text-slate-500 text-xs">time</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
