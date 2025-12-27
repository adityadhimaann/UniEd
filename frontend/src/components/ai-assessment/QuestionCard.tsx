import { HelpCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  className?: string;
}

export function QuestionCard({ questionNumber, question, className }: QuestionCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs text-cyan-500 uppercase tracking-wider mb-2 font-medium">
            Question {questionNumber}
          </p>
          <h2 className="text-lg md:text-xl font-semibold leading-relaxed">
            {question}
          </h2>
        </div>
      </div>
    </div>
  );
}
