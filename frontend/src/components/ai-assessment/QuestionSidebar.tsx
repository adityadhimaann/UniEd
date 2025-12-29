import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string | number;
  title: string;
  isCorrect: boolean | null;
}

interface QuestionSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
}

export function QuestionSidebar({ 
  questions, 
  currentQuestionIndex, 
  isCollapsed, 
  onToggle,
  onSelect 
}: QuestionSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white uppercase tracking-wider">Questions</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="h-6 w-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onSelect(index)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              currentQuestionIndex === index 
                ? "bg-cyan-500/20 border border-cyan-500/30" 
                : "bg-slate-800/30 hover:bg-slate-800/50"
            }`}
          >
            <div className={`h-6 w-6 rounded flex items-center justify-center text-xs font-medium shrink-0 ${
              question.isCorrect === true && "bg-green-500/20 text-green-400 border border-green-500/30"
            } ${
              question.isCorrect === false && "bg-red-500/20 text-red-400 border border-red-500/30"
            } ${
              question.isCorrect === null && currentQuestionIndex === index && "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            } ${
              question.isCorrect === null && currentQuestionIndex !== index && "bg-slate-700/50 text-slate-400"
            }`}>
              {question.isCorrect === true ? (
                <Check className="h-3 w-3" />
              ) : question.isCorrect === false ? (
                <X className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </div>
            
            <span className={`text-sm truncate text-left ${
              currentQuestionIndex === index 
                ? "font-medium text-white" 
                : "text-slate-400"
            }`}>
              Question {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
