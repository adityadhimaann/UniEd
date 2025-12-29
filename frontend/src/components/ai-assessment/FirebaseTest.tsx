import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseAssessmentService } from "@/services/firebaseAssessmentService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function FirebaseTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    saveSession: boolean | null;
    updateSession: boolean | null;
    getSession: boolean | null;
    updateStats: boolean | null;
    getStats: boolean | null;
    addLeaderboard: boolean | null;
    getLeaderboard: boolean | null;
  }>({
    saveSession: null,
    updateSession: null,
    getSession: null,
    updateStats: null,
    getStats: null,
    addLeaderboard: null,
    getLeaderboard: null,
  });

  const runTests = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    setTesting(true);
    const testResults = { ...results };

    try {
      // Test 1: Save Session
      toast.info("Testing: Save Session...");
      const sessionId = await firebaseAssessmentService.saveSession({
        userId: user.id,
        userName: user.name,
        topic: "Test Topic",
        difficulty: "medium",
        questions: [
          {
            id: "1",
            question: "Test question?",
            userAnswer: "Test answer",
            isCorrect: true,
            feedback: "Good job!",
            timeSpent: 30,
          },
        ],
        currentQuestionIndex: 0,
        score: 1,
        totalQuestions: 1,
        status: "in-progress",
        timeSpent: 30,
        startedAt: null as any,
      });
      testResults.saveSession = !!sessionId;
      toast.success("✓ Save Session: Success");

      // Test 2: Update Session
      toast.info("Testing: Update Session...");
      await firebaseAssessmentService.updateSession(sessionId, {
        currentQuestionIndex: 1,
        score: 1,
      });
      testResults.updateSession = true;
      toast.success("✓ Update Session: Success");

      // Test 3: Get Session
      toast.info("Testing: Get Session...");
      const session = await firebaseAssessmentService.getSession(sessionId);
      testResults.getSession = !!session;
      toast.success("✓ Get Session: Success");

      // Test 4: Complete Session
      toast.info("Testing: Complete Session...");
      await firebaseAssessmentService.completeSession(sessionId, 1, 30);
      toast.success("✓ Complete Session: Success");

      // Test 5: Update Stats
      toast.info("Testing: Update Stats...");
      await firebaseAssessmentService.updateUserStats(user.id, user.name, {
        ...session!,
        status: "completed",
        score: 1,
        timeSpent: 30,
      });
      testResults.updateStats = true;
      toast.success("✓ Update Stats: Success");

      // Test 6: Get Stats
      toast.info("Testing: Get Stats...");
      const stats = await firebaseAssessmentService.getUserStats(user.id);
      testResults.getStats = !!stats;
      toast.success("✓ Get Stats: Success");

      // Test 7: Add to Leaderboard
      toast.info("Testing: Add to Leaderboard...");
      await firebaseAssessmentService.addToLeaderboard({
        userId: user.id,
        userName: user.name,
        score: 100,
        topic: "Test Topic",
        difficulty: "medium",
        timeSpent: 30,
        completedAt: null as any,
      });
      testResults.addLeaderboard = true;
      toast.success("✓ Add to Leaderboard: Success");

      // Test 8: Get Leaderboard
      toast.info("Testing: Get Leaderboard...");
      const leaderboard = await firebaseAssessmentService.getGlobalLeaderboard(10);
      testResults.getLeaderboard = leaderboard.length > 0;
      toast.success("✓ Get Leaderboard: Success");

      toast.success("All tests passed! 🎉");
    } catch (error: any) {
      console.error("Test failed:", error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setResults(testResults);
      setTesting(false);
    }
  };

  const TestResult = ({ label, result }: { label: string; result: boolean | null }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
      <span className="text-sm text-slate-300">{label}</span>
      {result === null ? (
        <span className="text-slate-500">Not tested</span>
      ) : result ? (
        <CheckCircle className="h-5 w-5 text-green-400" />
      ) : (
        <XCircle className="h-5 w-5 text-red-400" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 p-6">
      <Card className="bg-slate-800/50 border-slate-700/50 p-6 max-w-2xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Firebase Integration Test</h1>
          <p className="text-slate-400 text-sm">
            Testing all Firebase features for Lisa AI Assessment
          </p>
        </div>

        <div className="space-y-2">
          <TestResult label="1. Save Assessment Session" result={results.saveSession} />
          <TestResult label="2. Update Session" result={results.updateSession} />
          <TestResult label="3. Get Session" result={results.getSession} />
          <TestResult label="4. Update User Stats" result={results.updateStats} />
          <TestResult label="5. Get User Stats" result={results.getStats} />
          <TestResult label="6. Add to Leaderboard" result={results.addLeaderboard} />
          <TestResult label="7. Get Leaderboard" result={results.getLeaderboard} />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={runTests}
            disabled={testing || !user}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run All Tests"
            )}
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            Reset
          </Button>
        </div>

        {!user && (
          <p className="text-center text-sm text-red-400">
            Please login to run tests
          </p>
        )}
      </Card>
    </div>
  );
}
