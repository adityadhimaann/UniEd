import { Mic, MicOff } from "lucide-react";

interface WaveformVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function WaveformVisualizer({ isActive, className }: WaveformVisualizerProps) {
  const bars = 40;
  
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col h-full ${className}`}>
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? "bg-cyan-500/20 border border-cyan-500/30" 
            : "bg-slate-700/50"
        }`}>
          {isActive ? (
            <Mic className="h-5 w-5 text-cyan-400" />
          ) : (
            <MicOff className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Voice Input
          </p>
          <p className="text-xs text-slate-400">
            {isActive ? "Recording..." : "Click to start recording"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-0.5 flex-1 bg-slate-900/50 rounded-lg px-4 min-h-0">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isActive 
                ? "bg-cyan-400" 
                : "bg-slate-600"
            }`}
            style={{
              height: isActive ? `${Math.random() * 100}%` : "20%",
              animationDelay: `${i * 0.05}s`,
              animation: isActive ? `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite` : "none",
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
