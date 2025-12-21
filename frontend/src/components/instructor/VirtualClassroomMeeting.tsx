import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { virtualClassService, VirtualClass } from '@/services/virtualClassService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  MessageSquare, Users, Hand, Phone, Send, BarChart3,
  Palette, Grid3x3, Maximize2, Pause, Play, Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useMinimizedMeeting } from '@/contexts/MinimizedMeetingContext';
import { format } from 'date-fns';
import { socket } from '@/lib/socket';

export default function VirtualClassroomMeeting() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setMinimizedMeeting } = useMinimizedMeeting();
  const [virtualClass, setVirtualClass] = useState<VirtualClass | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawTool, setDrawTool] = useState<'pen' | 'line' | 'rectangle' | 'circle' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(2);
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const whiteboardContainerRef = useRef<HTMLDivElement>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMinimizedNotification, setShowMinimizedNotification] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participantStreams, setParticipantStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isScreenShareFullscreen, setIsScreenShareFullscreen] = useState(false);
  const [screenShareUserId, setScreenShareUserId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const minimizedVideoRef = useRef<HTMLVideoElement>(null);
  
  const isHost = virtualClass?.host?._id === user?.id;
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if (classId) {
      fetchClassData();
      joinClass();
      initializeMedia();
      
      // Clear minimized meeting when returning to meeting
      setMinimizedMeeting(null);
    }

    return () => {
      if (classId && classId !== 'undefined') {
        leaveClass();
        cleanupMedia();
      }
    };
  }, [classId]);

  // Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      console.log('✅ Media stream obtained:', stream.getTracks().map(t => t.kind));
      
      // Set initial muted state
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
        console.log('🎤 Audio track enabled:', track.enabled);
      });
      
      // Set initial video state
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
        console.log('📹 Video track enabled:', track.enabled);
      });
      
      toast.success('Camera and microphone connected');
    } catch (error: any) {
      console.error('❌ Error accessing media devices:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions in your browser.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found on your device.');
      } else {
        toast.error('Could not access camera/microphone: ' + error.message);
      }
    }
  };

  // Cleanup media streams
  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    participantStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    setParticipantStreams(new Map());
  };

  // Update video element when local stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('📹 Video element updated with stream');
    }
  }, [localStream]);

  // Update screen share video element
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      console.log('🖥️ Screen share video element updated');
    }
  }, [screenStream]);

  // Update minimized preview video
  useEffect(() => {
    if (minimizedVideoRef.current && localStream && isMinimized) {
      minimizedVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isMinimized]);

  // Handle pause meeting
  const handlePauseMeeting = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      // Mute audio and turn off video when pausing
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = false);
        localStream.getVideoTracks().forEach(track => track.enabled = false);
      }
      setIsMuted(true);
      setIsVideoOff(true);
      
      // Notify participants
      socket.emit('virtualClass:paused', { classId });
      toast.info('Meeting paused - Audio and video disabled');
    } else {
      // Resume - keep audio/video off, let user enable manually
      socket.emit('virtualClass:resumed', { classId });
      toast.success('Meeting resumed');
    }
  };

  // Handle minimize meeting
  const handleMinimizeMeeting = () => {
    if (!virtualClass || !classId) return;
    
    // Set minimized meeting data in global context
    setMinimizedMeeting({
      classId,
      title: virtualClass.title,
      participantCount: virtualClass.participants?.filter(p => !p.leftAt).length || 0,
      isPaused,
      isVideoOff,
      localStream,
      userInitials: `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`,
    });
    
    setIsMinimized(true);
    setShowMinimizedNotification(true);
    navigate('/instructor');
    toast.info('Meeting minimized - Click preview to return');
  };

  // Socket.IO event listeners
  useEffect(() => {
    if (!classId || classId === 'undefined' || !socket) return;

    // Join virtual class room
    socket.emit('virtualClass:join', { classId });

    // Listen for participant joined
    socket.on('virtualClass:participant:joined', (data) => {
      console.log('Participant joined:', data);
      fetchClassData(); // Refresh participant list
      toast.success(`${data.participant.userName} joined the class`);
    });

    // Listen for participant left
    socket.on('virtualClass:participant:left', (data) => {
      console.log('Participant left:', data);
      fetchClassData(); // Refresh participant list
      toast.info(`${data.userName} left the class`);
    });

    // Listen for audio toggle
    socket.on('virtualClass:participant:audioToggled', (data) => {
      console.log('Audio toggled:', data);
      // Update participant list in real-time
      setVirtualClass(prev => {
        if (!prev) return prev;
        const updatedParticipants = prev.participants.map(p => 
          p.user._id === data.userId ? { ...p, isMuted: data.isMuted } : p
        );
        return { ...prev, participants: updatedParticipants };
      });
    });

    // Listen for video toggle
    socket.on('virtualClass:participant:videoToggled', (data) => {
      console.log('Video toggled:', data);
      // Update participant list in real-time
      setVirtualClass(prev => {
        if (!prev) return prev;
        const updatedParticipants = prev.participants.map(p => 
          p.user._id === data.userId ? { ...p, isVideoOff: data.isVideoOff } : p
        );
        return { ...prev, participants: updatedParticipants };
      });
    });

    // Listen for hand raised
    socket.on('virtualClass:participant:handToggled', (data) => {
      console.log('Hand toggled:', data);
      // Update participant list in real-time
      setVirtualClass(prev => {
        if (!prev) return prev;
        const updatedParticipants = prev.participants.map(p => 
          p.user._id === data.userId ? { ...p, isHandRaised: data.isHandRaised } : p
        );
        return { ...prev, participants: updatedParticipants };
      });
      if (data.isHandRaised) {
        toast.info(`${data.userName} raised their hand`);
      }
    });

    // Listen for chat messages
    socket.on('virtualClass:chat:message', (data) => {
      console.log('Chat message received:', data);
      setVirtualClass(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages || []), data],
        };
      });
      // Scroll to bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Listen for new polls
    socket.on('virtualClass:poll:new', (data) => {
      console.log('New poll:', data);
      // Add poll to state in real-time
      setVirtualClass(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          polls: [...(prev.polls || []), data.poll],
        };
      });
      toast.success('New poll created');
    });

    // Listen for poll votes
    socket.on('virtualClass:poll:voted', (data) => {
      console.log('Poll voted:', data);
      // Update poll results in real-time
      setVirtualClass(prev => {
        if (!prev) return prev;
        const updatedPolls = prev.polls?.map(poll => 
          poll._id === data.pollId ? data.poll : poll
        );
        return { ...prev, polls: updatedPolls };
      });
    });

    // Listen for whiteboard updates
    socket.on('virtualClass:whiteboard:updated', (data) => {
      console.log('Whiteboard updated:', data);
      // Update whiteboard canvas in real-time
      if (canvasRef && data.whiteboardData) {
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = data.whiteboardData;
        }
      }
    });

    // Listen for screen share start
    socket.on('virtualClass:screenShare:started', (data) => {
      console.log('Screen share started:', data);
      setScreenShareUserId(data.userId);
      toast.info(`${data.userName} started sharing screen`);
    });

    // Listen for screen share stop
    socket.on('virtualClass:screenShare:stopped', (data) => {
      console.log('Screen share stopped:', data);
      setScreenShareUserId(null);
      setIsScreenShareFullscreen(false);
      toast.info(`${data.userName} stopped sharing screen`);
    });

    // Listen for file shared
    socket.on('virtualClass:file:new', (data) => {
      console.log('File shared:', data);
      fetchClassData();
      toast.success(`${data.sharedBy.userName} shared a file`);
    });

    // Listen for class started
    socket.on('virtualClass:started', (data) => {
      console.log('Class started:', data);
      fetchClassData();
      toast.success('Class has started!');
    });

    // Listen for class ended
    socket.on('virtualClass:ended', (data) => {
      console.log('Class ended:', data);
      toast.info('Class has ended');
      setTimeout(() => {
        const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
        navigate(redirectPath);
      }, 2000);
    });

    // Listen for being kicked
    socket.on('virtualClass:kicked', (data) => {
      toast.error('You have been removed from the class');
      const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
      navigate(redirectPath);
    });

    // Listen for being muted by host
    socket.on('virtualClass:muted:byHost', (data) => {
      setIsMuted(true);
      toast.warning(`You have been muted by ${data.mutedBy}`);
    });

    // Listen for meeting paused
    socket.on('virtualClass:paused', () => {
      toast.warning('Host has paused the meeting');
    });

    // Listen for meeting resumed
    socket.on('virtualClass:resumed', () => {
      toast.success('Host has resumed the meeting');
    });

    // Cleanup
    return () => {
      socket.emit('virtualClass:leave', { classId });
      socket.off('virtualClass:participant:joined');
      socket.off('virtualClass:participant:left');
      socket.off('virtualClass:participant:audioToggled');
      socket.off('virtualClass:participant:videoToggled');
      socket.off('virtualClass:participant:handToggled');
      socket.off('virtualClass:chat:message');
      socket.off('virtualClass:poll:new');
      socket.off('virtualClass:poll:voted');
      socket.off('virtualClass:whiteboard:updated');
      socket.off('virtualClass:screenShare:started');
      socket.off('virtualClass:screenShare:stopped');
      socket.off('virtualClass:file:new');
      socket.off('virtualClass:started');
      socket.off('virtualClass:ended');
      socket.off('virtualClass:kicked');
      socket.off('virtualClass:muted:byHost');
      socket.off('virtualClass:paused');
      socket.off('virtualClass:resumed');
    };
  }, [classId, user, navigate]);

  const fetchClassData = async () => {
    if (!classId || classId === 'undefined') {
      toast.error('Invalid class ID');
      const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
      navigate(redirectPath);
      return;
    }

    try {
      const response = await virtualClassService.getVirtualClassById(classId);
      setVirtualClass(response.data);
    } catch (error: any) {
      console.error('Error fetching class data:', error);
      toast.error('Failed to load class data');
      const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
      navigate(redirectPath);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async () => {
    if (!classId || classId === 'undefined') return;
    try {
      await virtualClassService.joinVirtualClass(classId);
    } catch (error: any) {
      console.error('Error joining class:', error);
    }
  };

  const leaveClass = async () => {
    if (!classId || classId === 'undefined') return;
    try {
      await virtualClassService.leaveVirtualClass(classId);
    } catch (error: any) {
      console.error('Error leaving class:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !classId) return;
    try {
      await virtualClassService.sendChatMessage(classId, chatMessage);
      
      // Emit Socket.IO event
      socket.emit('virtualClass:chat:send', {
        classId,
        message: chatMessage,
        isPrivate: false,
      });
      
      setChatMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || !classId) {
      toast.error('Please enter a poll question');
      return;
    }
    const validOptions = pollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }
    try {
      const response = await virtualClassService.createPoll(classId, pollQuestion, validOptions);
      toast.success('Poll created successfully');
      setShowCreatePoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      
      // Socket.IO event will be emitted from backend
      fetchClassData();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!classId) return;
    try {
      await virtualClassService.voteOnPoll(classId, pollId, optionIndex);
      toast.success('Vote recorded');
      
      // Socket.IO event will be emitted from backend
      fetchClassData();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleEndClass = async () => {
    if (!classId || !confirm('Are you sure you want to end this class?')) return;
    try {
      await virtualClassService.endVirtualClass(classId);
      toast.success('Class ended successfully');
      
      // Clear minimized meeting
      setMinimizedMeeting(null);
      
      // Socket.IO event will be emitted from backend
      setTimeout(() => {
        const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
        navigate(redirectPath);
      }, 1000);
    } catch (error: any) {
      console.error('Error ending class:', error);
      toast.error('Failed to end class');
    }
  };

  const handleRaiseHand = async () => {
    if (!classId) return;
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    
    // Emit Socket.IO event
    socket.emit('virtualClass:toggleHand', {
      classId,
      isHandRaised: newHandState,
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost) return;
    setIsDrawing(true);
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawStartPos({ x, y });
    
    if (drawTool === 'pen' || drawTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isHost) return;
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = drawTool === 'eraser' ? '#FFFFFF' : drawColor;
    ctx.lineWidth = drawTool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (drawTool === 'pen' || drawTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isHost) return;
    
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (drawTool !== 'pen' && drawTool !== 'eraser' && drawStartPos) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(drawStartPos.x, drawStartPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (drawTool === 'rectangle') {
        ctx.beginPath();
        ctx.rect(drawStartPos.x, drawStartPos.y, x - drawStartPos.x, y - drawStartPos.y);
        ctx.stroke();
      } else if (drawTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - drawStartPos.x, 2) + Math.pow(y - drawStartPos.y, 2));
        ctx.beginPath();
        ctx.arc(drawStartPos.x, drawStartPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
    
    setIsDrawing(false);
    setDrawStartPos(null);
    
    // Broadcast whiteboard changes to all participants (only if host)
    if (isHost && canvas && classId) {
      const whiteboardData = canvas.toDataURL();
      socket.emit('virtualClass:whiteboard:update', {
        classId,
        whiteboardData,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  if (!virtualClass) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Class not found</h2>
          <Button onClick={() => {
            const redirectPath = user?.role === 'faculty' ? '/instructor/virtual-classroom' : '/dashboard/virtual-classes';
            navigate(redirectPath);
          }}>
            Back to Virtual Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Screen Share Overlay */}
      {screenShareUserId && (
        <div className={`${isScreenShareFullscreen ? 'fixed inset-0 z-50 bg-black' : 'fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-4/5 h-3/4'} flex flex-col`}>
          <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">
                {screenShareUserId === user?.id ? 'You are' : `${virtualClass.participants?.find(p => p.user._id === screenShareUserId)?.user.firstName || 'Someone'} is`} sharing screen
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsScreenShareFullscreen(!isScreenShareFullscreen)}
                className="text-white border-gray-600 hover:bg-gray-800">
                {isScreenShareFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              {screenShareUserId !== user?.id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setScreenShareUserId(null);
                    setIsScreenShareFullscreen(false);
                  }}
                  className="text-white border-gray-600 hover:bg-gray-800">
                  Close
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 bg-black flex items-center justify-center">
            {screenShareUserId === user?.id && screenStream ? (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-white">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Viewing shared screen</p>
                <p className="text-sm text-gray-400 mt-2">Screen content will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Top toolbar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{virtualClass.title}</h1>
          <p className="text-sm text-muted-foreground">
            {virtualClass.course?.courseCode} - {virtualClass.course?.courseName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white animate-pulse">
            ● LIVE
          </span>
          <span className="text-sm text-muted-foreground">
            {virtualClass.participants?.filter(p => !p.leftAt).length || 0} participants
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto bg-gray-900">
          <div className={`grid gap-4 h-full ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
          }`}>
            {/* Local user video (always show first) */}
            {user && (
              <Card key={user.id} className="relative aspect-video bg-gray-800 border-gray-700 overflow-hidden">
                {/* Video element */}
                {localStream && !isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Status indicators */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {isMuted && (
                    <div className="bg-red-500 rounded-full p-1.5">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isVideoOff && (
                    <div className="bg-gray-600 rounded-full p-1.5">
                      <VideoOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Name tag */}
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  You
                </div>
                
                {/* Hand raised indicator */}
                {isHandRaised && (
                  <div className="absolute top-2 right-2">
                    <Hand className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </Card>
            )}
            
            {/* Other participants */}
            {virtualClass.participants?.filter(p => !p.leftAt && p.user._id !== user?.id).map((participant) => (
              <Card key={participant.user._id} className="relative aspect-video bg-gray-800 border-gray-700 overflow-hidden">
                {/* Show avatar when video is off */}
                {participant.isVideoOff ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {participant.user.firstName?.[0]}{participant.user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-white/50 mx-auto mb-2" />
                      <p className="text-sm text-white/70">Camera enabled</p>
                    </div>
                  </div>
                )}
                
                {/* Status indicators */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {participant.isMuted && (
                    <div className="bg-red-500 rounded-full p-1.5">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {participant.isVideoOff && (
                    <div className="bg-gray-600 rounded-full p-1.5">
                      <VideoOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Name tag */}
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  {participant.user.firstName} {participant.user.lastName}
                </div>
                
                {/* Hand raised indicator */}
                {participant.isHandRaised && (
                  <div className="absolute top-2 right-2">
                    <Hand className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 border-l border-border flex flex-col bg-card">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => { setShowChat(true); setShowParticipants(false); setShowPolls(false); setShowWhiteboard(false); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${showChat ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />Chat
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(true); setShowPolls(false); setShowWhiteboard(false); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${showParticipants ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <Users className="w-4 h-4 mx-auto mb-1" />People
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(false); setShowPolls(true); setShowWhiteboard(false); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${showPolls ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <BarChart3 className="w-4 h-4 mx-auto mb-1" />Polls
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(false); setShowPolls(false); setShowWhiteboard(true); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${showWhiteboard ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <Palette className="w-4 h-4 mx-auto mb-1" />Board
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {showChat && (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {virtualClass.chatMessages?.map((msg, index) => {
                      const isOwnMessage = msg.sender._id === user?.id;
                      return (
                        <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                            {!isOwnMessage && (
                              <span className="text-xs font-medium text-primary mb-1">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </span>
                            )}
                            <div className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage 
                                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                            }`}>
                              <p className="text-sm break-words">{msg.message}</p>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {format(new Date(msg.timestamp), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {(!virtualClass.chatMessages || virtualClass.chatMessages.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..." className="flex-1" />
                    <Button onClick={handleSendMessage} size="icon"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            )}

            {showParticipants && (
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {virtualClass.participants?.filter(p => !p.leftAt).map((participant) => (
                    <div key={participant.user._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{participant.user.firstName?.[0]}{participant.user.lastName?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.user.firstName} {participant.user.lastName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
                      </div>
                      {participant.isHandRaised && <Hand className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      {participant.isMuted && <MicOff className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {showPolls && (
              <div className="flex-1 overflow-auto p-4">
                {isHost && <Button onClick={() => setShowCreatePoll(true)} className="w-full mb-4">Create Poll</Button>}
                <div className="space-y-4">
                  {virtualClass.polls?.map((poll) => (
                    <Card key={poll._id} className="p-4">
                      <h3 className="font-medium mb-3">{poll.question}</h3>
                      <div className="space-y-2">
                        {poll.options.map((option, index) => {
                          const optionVotes = option.votes?.length || 0;
                          const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                          const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                          return (
                            <button key={index} onClick={() => handleVote(poll._id, index)}
                              className="w-full text-left p-3 rounded border border-border hover:bg-secondary relative overflow-hidden transition-colors">
                              <div className="absolute inset-0 bg-primary/10" style={{ width: `${percentage}%` }} />
                              <div className="relative flex justify-between items-center">
                                <span className="font-medium">{option.text}</span>
                                <span className="text-sm text-muted-foreground">{optionVotes} ({percentage.toFixed(0)}%)</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                  {(!virtualClass.polls || virtualClass.polls.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No polls yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showWhiteboard && (
              <div ref={whiteboardContainerRef} className={`flex-1 p-4 flex flex-col ${isWhiteboardFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
                {isHost && (
                  <div className="mb-3 flex flex-wrap gap-2 items-center border-b border-border pb-3">
                    <div className="flex gap-2">
                      <Button 
                        variant={drawTool === 'pen' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDrawTool('pen')}
                        title="Pen">
                        ✏️
                      </Button>
                      <Button 
                        variant={drawTool === 'line' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDrawTool('line')}
                        title="Line">
                        📏
                      </Button>
                      <Button 
                        variant={drawTool === 'rectangle' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDrawTool('rectangle')}
                        title="Rectangle">
                        ▭
                      </Button>
                      <Button 
                        variant={drawTool === 'circle' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDrawTool('circle')}
                        title="Circle">
                        ⭕
                      </Button>
                      <Button 
                        variant={drawTool === 'eraser' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDrawTool('eraser')}
                        title="Eraser">
                        🧹
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={drawColor} 
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-border" 
                        title="Color" />
                      
                      <select 
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="px-2 py-1 rounded border border-border bg-background text-sm">
                        <option value="1">Thin</option>
                        <option value="2">Normal</option>
                        <option value="4">Thick</option>
                        <option value="6">Very Thick</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={() => {
                        if (canvasRef) {
                          const ctx = canvasRef.getContext('2d');
                          if (ctx) {
                            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
                            // Broadcast clear to all participants
                            socket.emit('virtualClass:whiteboard:update', {
                              classId,
                              whiteboardData: canvasRef.toDataURL(),
                            });
                          }
                        }
                      }}>
                        Clear Board
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsWhiteboardFullscreen(!isWhiteboardFullscreen)}
                        title={isWhiteboardFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                        {isWhiteboardFullscreen ? '🗗' : '⛶'}
                      </Button>
                    </div>
                  </div>
                )}
                {!isHost && (
                  <div className="mb-3 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <Palette className="w-4 h-4 inline mr-1" />
                      View only - Host is drawing
                    </div>
                    {isWhiteboardFullscreen && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsWhiteboardFullscreen(false)}>
                        Exit Fullscreen
                      </Button>
                    )}
                  </div>
                )}
                <canvas 
                  ref={(el) => setCanvasRef(el)}
                  width={isWhiteboardFullscreen ? window.innerWidth - 40 : 280} 
                  height={isWhiteboardFullscreen ? window.innerHeight - 150 : 400}
                  className={`border border-border rounded-lg bg-white ${isHost ? 'cursor-crosshair' : 'cursor-not-allowed'} ${isWhiteboardFullscreen ? 'flex-1' : ''}`}
                  onMouseDown={isHost ? startDrawing : undefined} 
                  onMouseMove={isHost ? draw : undefined} 
                  onMouseUp={isHost ? stopDrawing : undefined} 
                  onMouseLeave={isHost ? stopDrawing : undefined} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-card border-t border-border px-4 py-4 flex items-center justify-center gap-3">
        <Button variant={isMuted ? 'destructive' : 'outline'} size="lg" onClick={() => {
          const newMutedState = !isMuted;
          setIsMuted(newMutedState);
          
          console.log('🎤 Toggling audio:', newMutedState ? 'MUTED' : 'UNMUTED');
          
          // Toggle audio track
          if (localStream) {
            localStream.getAudioTracks().forEach(track => {
              track.enabled = !newMutedState;
              console.log('🎤 Audio track enabled:', track.enabled);
            });
          }
          
          socket.emit('virtualClass:toggleAudio', { classId, isMuted: newMutedState });
        }}
          className="rounded-full w-12 h-12 p-0">
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        <Button variant={isVideoOff ? 'destructive' : 'outline'} size="lg" onClick={() => {
          const newVideoState = !isVideoOff;
          setIsVideoOff(newVideoState);
          
          console.log('📹 Toggling video:', newVideoState ? 'OFF' : 'ON');
          
          // Toggle video track
          if (localStream) {
            localStream.getVideoTracks().forEach(track => {
              track.enabled = !newVideoState;
              console.log('📹 Video track enabled:', track.enabled);
            });
          }
          
          socket.emit('virtualClass:toggleVideo', { classId, isVideoOff: newVideoState });
        }}
          className="rounded-full w-12 h-12 p-0">
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>
        
        {/* Screen Share - Faculty Only */}
        {isHost && (
          <Button variant={isScreenSharing ? 'default' : 'outline'} size="lg" onClick={async () => {
            if (!isScreenSharing) {
              // Start screen sharing
              try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                  video: {
                    displaySurface: 'monitor'
                  } as any,
                  audio: false
                });
                
                setScreenStream(stream);
                setIsScreenSharing(true);
                setScreenShareUserId(user?.id || null);
                
                // Listen for when user stops sharing via browser UI
                stream.getVideoTracks()[0].onended = () => {
                  setScreenStream(null);
                  setIsScreenSharing(false);
                  setScreenShareUserId(null);
                  socket.emit('virtualClass:screenShare:stop', { classId });
                  toast.info('Screen sharing stopped');
                };
                
                socket.emit('virtualClass:screenShare:start', { classId });
                toast.success('Screen sharing started');
                console.log('🖥️ Screen sharing started');
              } catch (error: any) {
                console.error('Error starting screen share:', error);
                if (error.name === 'NotAllowedError') {
                  toast.error('Screen sharing permission denied');
                } else {
                  toast.error('Could not start screen sharing');
                }
              }
            } else {
              // Stop screen sharing
              if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
                setScreenStream(null);
              }
              setIsScreenSharing(false);
              setScreenShareUserId(null);
              socket.emit('virtualClass:screenShare:stop', { classId });
              toast.info('Screen sharing stopped');
              console.log('🖥️ Screen sharing stopped');
            }
          }}
            className="rounded-full w-12 h-12 p-0">
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>
        )}
        
        {/* Raise Hand - Students Only */}
        {isStudent && (
          <Button variant={isHandRaised ? 'default' : 'outline'} size="lg" onClick={handleRaiseHand}
            className="rounded-full w-12 h-12 p-0">
            <Hand className="w-5 h-5" />
          </Button>
        )}
        
        <Button variant="outline" size="lg" onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
          className="rounded-full w-12 h-12 p-0">
          {viewMode === 'grid' ? <Maximize2 className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
        </Button>
        
        {/* Faculty: Pause, Minimize, and End Class Buttons */}
        {isHost && (
          <div className="ml-auto flex gap-2">
            <Button 
              variant={isPaused ? 'default' : 'outline'} 
              onClick={handlePauseMeeting} 
              size="lg" 
              className="rounded-full px-6"
              title={isPaused ? 'Resume Meeting' : 'Pause Meeting'}>
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMinimizeMeeting} 
              size="lg" 
              className="rounded-full px-6"
              title="Minimize Meeting">
              <Minimize2 className="w-5 h-5 mr-2" />
              Minimize
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEndClass} 
              size="lg" 
              className="rounded-full px-6">
              <Phone className="w-5 h-5 mr-2" />End Class
            </Button>
          </div>
        )}
        
        {/* Students: Minimize and Leave Buttons */}
        {isStudent && (
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsMinimized(true);
              setShowMinimizedNotification(true);
              const redirectPath = '/dashboard';
              navigate(redirectPath);
              toast.info('Meeting minimized');
            }} size="lg" className="rounded-full px-6">
              Minimize
            </Button>
            <Button variant="destructive" onClick={async () => {
              if (confirm('Are you sure you want to leave this class?')) {
                await leaveClass();
                const redirectPath = '/dashboard/virtual-classes';
                navigate(redirectPath);
                toast.info('You left the class');
              }
            }} size="lg" className="rounded-full px-6">
              <Phone className="w-5 h-5 mr-2" />Leave
            </Button>
          </div>
        )}
      </div>

      {/* Minimized Meeting Notification - Bottom Right */}
      {showMinimizedNotification && isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <Card className="w-80 bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-2xl">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Meeting in Progress</h3>
                    <p className="text-white/80 text-sm">{virtualClass?.title}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMinimizedNotification(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full">
                  ✕
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-3 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{virtualClass?.participants?.filter(p => !p.leftAt).length || 0} participants</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Live</span>
              </div>
              
              <Button
                onClick={() => {
                  setIsMinimized(false);
                  setShowMinimizedNotification(false);
                  navigate(`/instructor/virtual-class/${classId}`);
                }}
                className="w-full bg-white text-blue-600 hover:bg-white/90 font-medium">
                Return to Meeting
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Poll Dialog */}
      <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Poll</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Enter your question..." />
            </div>
            <div>
              <label className="text-sm font-medium">Options</label>
              {pollOptions.map((option, index) => (
                <Input key={index} value={option} onChange={(e) => {
                  const newOptions = [...pollOptions];
                  newOptions[index] = e.target.value;
                  setPollOptions(newOptions);
                }} placeholder={`Option ${index + 1}`} className="mt-2" />
              ))}
              <Button variant="outline" onClick={() => setPollOptions([...pollOptions, ''])} className="w-full mt-2">
                Add Option
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreatePoll(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreatePoll} className="flex-1">Create Poll</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
