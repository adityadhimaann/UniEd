import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, X, Lightbulb, ArrowRight } from "lucide-react";
import lisaPng from "@/assets/lisa.png";

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  suggestions: string;
  onClose: () => void;
  onNext: () => void;
}

export function FeedbackOverlay({ 
  isVisible, 
  isCorrect, 
  suggestions, 
  onClose,
  onNext 
}: FeedbackOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full w-full max-w-md bg-card border-l border-border p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img src={lisaPng} alt="Lisa AI" className="h-8 w-8 rounded-lg" />
            <h2 className="text-lg font-semibold">Lisa's Evaluation</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-6">
          {/* Result Badge */}
          <div className="flex justify-center">
            <Badge 
              className={`text-lg px-6 py-2 ${
                isCorrect 
                  ? "bg-green-500/20 text-green-500 border-green-500/50" 
                  : "bg-red-500/20 text-red-500 border-red-500/50"
              }`}
            >
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </Badge>
          </div>

          {/* Audio Feedback */}
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 relative">
              <Volume2 className="h-5 w-5 text-cyan-500" />
              <span className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-ping opacity-75" />
            </div>
            <p className="text-sm text-muted-foreground">Lisa is speaking...</p>
          </div>

          {/* Suggestions */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-medium text-cyan-500">Lisa's Suggestions</h3>
            </div>
            <p className="text-sm leading-relaxed">
              {suggestions}
            </p>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          onClick={onNext}
        >
          Next Question
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
