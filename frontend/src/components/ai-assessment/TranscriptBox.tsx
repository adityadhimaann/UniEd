import { FileText } from "lucide-react";

interface TranscriptBoxProps {
  transcript: string;
  isActive: boolean;
  className?: string;
}

export function TranscriptBox({ transcript, isActive, className }: TranscriptBoxProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-6 h-[200px] flex flex-col ${className}`}>
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <FileText className="h-4 w-4 text-cyan-500" />
        <h3 className="text-sm font-medium">Transcript</h3>
        {isActive && (
          <span className="flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        )}
      </div>
      
      <div className="flex-1 min-h-0 bg-secondary/30 rounded-lg p-4 overflow-y-auto">
        {transcript ? (
          <p className="text-foreground/80 leading-relaxed text-sm">
            {transcript}
            {isActive && (
              <span className="inline-block w-0.5 h-4 bg-cyan-500 ml-1 animate-pulse" />
            )}
          </p>
        ) : (
          <p className="text-muted-foreground/50 text-sm italic">
            Your spoken words will appear here...
          </p>
        )}
      </div>
    </div>
  );
}
