import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Maximize2, Pause } from 'lucide-react';

interface MinimizedMeetingData {
  classId: string;
  title: string;
  participantCount: number;
  isPaused: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  userInitials: string;
}

interface MinimizedMeetingContextType {
  minimizedMeeting: MinimizedMeetingData | null;
  setMinimizedMeeting: (data: MinimizedMeetingData | null) => void;
}

const MinimizedMeetingContext = createContext<MinimizedMeetingContextType | undefined>(undefined);

export function MinimizedMeetingProvider({ children }: { children: ReactNode }) {
  const [minimizedMeeting, setMinimizedMeeting] = useState<MinimizedMeetingData | null>(null);
  const navigate = useNavigate();

  const handleReturnToMeeting = () => {
    if (minimizedMeeting) {
      navigate(`/instructor/virtual-class/${minimizedMeeting.classId}`);
      setMinimizedMeeting(null);
    }
  };

  return (
    <MinimizedMeetingContext.Provider value={{ minimizedMeeting, setMinimizedMeeting }}>
      {children}
      
      {/* Global Minimized Preview Window */}
      {minimizedMeeting && (
        <div 
          className="fixed bottom-4 right-4 z-50 w-80 bg-card border-2 border-primary rounded-lg shadow-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          onClick={handleReturnToMeeting}>
          <div className="bg-primary px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-white font-medium text-sm">Meeting in Progress</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-white hover:bg-primary-dark"
              onClick={(e) => {
                e.stopPropagation();
                handleReturnToMeeting();
              }}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative aspect-video bg-gray-900">
            {minimizedMeeting.localStream && !minimizedMeeting.isVideoOff ? (
              <video
                ref={(el) => {
                  if (el && minimizedMeeting.localStream) {
                    el.srcObject = minimizedMeeting.localStream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-white">
                      {minimizedMeeting.userInitials}
                    </span>
                  </div>
                  <p className="text-white text-xs">{minimizedMeeting.title}</p>
                </div>
              </div>
            )}
            {minimizedMeeting.isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Pause className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">Meeting Paused</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-card px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {minimizedMeeting.participantCount} participants
            </span>
            <span className="text-primary font-medium">Click to return</span>
          </div>
        </div>
      )}
    </MinimizedMeetingContext.Provider>
  );
}

export function useMinimizedMeeting() {
  const context = useContext(MinimizedMeetingContext);
  if (context === undefined) {
    throw new Error('useMinimizedMeeting must be used within a MinimizedMeetingProvider');
  }
  return context;
}
