import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import lisaPng from "@/assets/lisa.png";
import lisaGif from "@/assets/lisa.gif";

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
    <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-2xl w-full space-y-6 md:space-y-8 shadow-xl mt-16 md:mt-20">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <img src={lisaPng} alt="Lisa AI" className="h-20 w-20 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            AI Assessment
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
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
                className={`p-3 md:p-4 rounded-xl text-center transition-all duration-200 border ${
                  selectedDifficulty === diff.value
                    ? "bg-cyan-500/20 border-cyan-500"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
              >
                <Badge className="mb-2 text-xs">{diff.label}</Badge>
                <p className="text-xs text-muted-foreground">{diff.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <img src={lisaGif} alt="Loading" className="h-5 w-5 mr-2 mix-blend-screen" />
              Lisa is preparing...
            </>
          ) : (
            <>
              Start Assessment
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Lisa will adapt difficulty based on your performance
        </p>
      </div>
    </div>
  );
}
