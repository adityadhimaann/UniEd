import { FileText } from "lucide-react";

interface TranscriptBoxProps {
  transcript: string;
  isActive: boolean;
  className?: string;
}

export function TranscriptBox({ transcript, isActive, className }: TranscriptBoxProps) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col h-full min-h-0 ${className}`}>
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <FileText className="h-5 w-5 text-cyan-400" />
        <h3 className="text-sm font-medium text-white">Transcript</h3>
        {isActive && (
          <span className="flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
        )}
      </div>
      
      <div className="flex-1 min-h-0 bg-slate-900/50 rounded-lg p-4 overflow-y-auto">
        {transcript ? (
          <p className="text-slate-300 leading-relaxed text-sm">
            {transcript}
            {isActive && (
              <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-1 animate-pulse" />
            )}
          </p>
        ) : (
          <p className="text-slate-500 text-sm italic">
            Your spoken words will appear here...
          </p>
        )}
      </div>
    </div>
  );
}
