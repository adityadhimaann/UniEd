import { HelpCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  className?: string;
}

export function QuestionCard({ questionNumber, question, className }: QuestionCardProps) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-wider mb-1 md:mb-2 font-medium">
            Question {questionNumber}
          </p>
          <h2 className="text-base md:text-lg font-medium text-white leading-relaxed">
            {question}
          </h2>
        </div>
      </div>
    </div>
  );
}
