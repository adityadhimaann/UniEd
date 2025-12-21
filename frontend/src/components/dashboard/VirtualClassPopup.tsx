import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Users, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

interface VirtualClassNotification {
  _id: string;
  title: string;
  courseCode: string;
  courseName: string;
  participantCount: number;
  startTime: string;
}

export function VirtualClassPopup() {
  const [liveClasses, setLiveClasses] = useState<VirtualClassNotification[]>([]);
  const [dismissedClasses, setDismissedClasses] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for virtual class started notifications
    socket.on('new:notification', (notification) => {
      if (notification.type === 'virtual_class' && notification.title === 'Virtual Class Started') {
        // Extract class info from notification
        const classInfo: VirtualClassNotification = {
          _id: notification._id,
          title: notification.content.split(' is now live!')[0],
          courseCode: '',
          courseName: '',
          participantCount: 0,
          startTime: new Date().toISOString(),
        };
        
        setLiveClasses(prev => {
          // Check if already exists
          if (prev.some(c => c._id === classInfo._id)) {
            return prev;
          }
          return [...prev, classInfo];
        });
      }
    });

    // Listen for virtual class started event
    socket.on('virtualClass:started', (data) => {
      const classInfo: VirtualClassNotification = {
        _id: data.classId,
        title: data.title,
        courseCode: '',
        courseName: '',
        participantCount: 0,
        startTime: data.startTime,
      };
      
      setLiveClasses(prev => {
        if (prev.some(c => c._id === classInfo._id)) {
          return prev;
        }
        return [...prev, classInfo];
      });
    });

    return () => {
      socket.off('new:notification');
      socket.off('virtualClass:started');
    };
  }, [user]);

  const handleJoinClass = (classId: string) => {
    navigate(`/dashboard/virtual-classes`);
    handleDismiss(classId);
  };

  const handleDismiss = (classId: string) => {
    setDismissedClasses(prev => new Set([...prev, classId]));
    setLiveClasses(prev => prev.filter(c => c._id !== classId));
  };

  const visibleClasses = liveClasses.filter(c => !dismissedClasses.has(c._id));

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {visibleClasses.map((classInfo, index) => (
          <motion.div
            key={classInfo._id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="w-96 bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Class is Live!</h3>
                      <p className="text-white/90 text-sm">{classInfo.title}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(classInfo._id)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span>Live Now</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Just started</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinClass(classInfo._id)}
                    className="flex-1 bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-lg">
                    <Video className="w-4 h-4 mr-2" />
                    Join Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(classInfo._id)}
                    className="border-white/30 text-white hover:bg-white/10">
                    Later
                  </Button>
                </div>
              </div>
              
              {/* Animated border */}
              <div className="h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse"></div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
