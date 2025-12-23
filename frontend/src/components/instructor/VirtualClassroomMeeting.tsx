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
  const lastWhiteboardUpdate = useRef<number>(0);
  const whiteboardUpdateThrottle = 100; // ms between updates
  
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMinimizedNotification, setShowMinimizedNotification] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participantStreams, setParticipantStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isScreenShareFullscreen, setIsScreenShareFullscreen] = useState(false);
  const [screenShareUserId, setScreenShareUserId] = useState<string | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [pendingIceCandidates, setPendingIceCandidates] = useState<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const minimizedVideoRef = useRef<HTMLVideoElement>(null);
  const participantVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const isHost = virtualClass?.host?._id === user?.id || user?.role === 'faculty';
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

  // Establish peer connections when participants list updates AND we have local stream
  useEffect(() => {
    if (!virtualClass?.participants || !localStream) {
      console.log('⏳ Waiting for participants and local stream...');
      return;
    }

    console.log('👥 Participants list updated. Total participants:', virtualClass.participants.length);
    console.log('🎥 Local stream available with', localStream.getTracks().length, 'tracks');

    // Connect to all active participants
    const activeParticipants = virtualClass.participants.filter(p => !p.leftAt && p.user._id !== user?.id);
    
    console.log('🔗 Need to connect to', activeParticipants.length, 'participants');
    
    activeParticipants.forEach(participant => {
      const participantId = participant.user._id;
      
      // Only create connection if it doesn't exist or is in failed state
      const existingPc = peerConnections.get(participantId);
      
      if (!existingPc) {
        console.log('🆕 Creating new connection with', participant.user.firstName, participantId);
        // Use polite/impolite pattern - user with lower ID is polite
        const isPolite = (user?.id || '') < participantId;
        setTimeout(() => {
          if (isPolite) {
            console.log('😊 Being polite - waiting for offer from', participant.user.firstName);
          } else {
            console.log('😎 Being impolite - creating offer for', participant.user.firstName);
            createOffer(participantId);
          }
        }, 500);
      } else if (existingPc.connectionState === 'failed' || existingPc.connectionState === 'closed') {
        console.log('🔄 Reconnecting with', participant.user.firstName);
        existingPc.close();
        peerConnections.delete(participantId);
        setTimeout(() => {
          createOffer(participantId);
        }, 1000);
      } else {
        console.log('✅ Connection already exists with', participant.user.firstName, '- State:', existingPc.connectionState);
      }
    });
    
    // Clean up connections for participants who left
    peerConnections.forEach((pc, participantId) => {
      const stillActive = activeParticipants.some(p => p.user._id === participantId);
      if (!stillActive) {
        console.log('🧹 Cleaning up connection with', participantId);
        pc.close();
        peerConnections.delete(participantId);
        setParticipantStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(participantId);
          return newMap;
        });
      }
    });
  }, [virtualClass?.participants, localStream, user?.id]);

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
      
      // Don't disable tracks initially - just set state
      // Tracks will be managed by toggle functions
      
      // Setup audio level detection for speaking indicator
      setupAudioLevelDetection(stream);
      
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

  // Setup audio level detection for speaking indicator
  const setupAudioLevelDetection = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (error) {
      console.error('Error setting up audio detection:', error);
    }
  };

  // Monitor audio level to detect speaking
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Threshold for speaking detection (adjust as needed)
      const isSpeaking = average > 20 && !isMuted;
      
      // Update speaking state
      setSpeakingUsers(prev => {
        const newSet = new Set(prev);
        if (isSpeaking && user?.id) {
          newSet.add(user.id);
          // Emit speaking event to other participants
          socket.emit('virtualClass:speaking', { classId, userId: user.id, isSpeaking: true });
        } else if (!isSpeaking && user?.id && prev.has(user.id)) {
          newSet.delete(user.id);
          socket.emit('virtualClass:speaking', { classId, userId: user.id, isSpeaking: false });
        }
        return newSet;
      });
      
      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };
    
    checkAudioLevel();
  };

  // Cleanup media streams
  const cleanupMedia = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());
    
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

  // Create WebRTC peer connection
  const createPeerConnection = (participantId: string): RTCPeerConnection => {
    console.log('🔗 Creating peer connection with', participantId);
    
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, localStream);
        console.log('➕ Added local track:', track.kind, 'enabled:', track.enabled);
      });
    } else {
      console.warn('⚠️ No local stream available when creating peer connection');
    }

    // Handle incoming tracks from remote peer
    pc.ontrack = (event) => {
      console.log('📹 Received remote track from', participantId, '- Kind:', event.track.kind, 'Enabled:', event.track.enabled);
      const remoteStream = event.streams[0];
      
      if (remoteStream) {
        console.log('✅ Remote stream received with', remoteStream.getTracks().length, 'tracks');
        
        // Log all tracks
        remoteStream.getTracks().forEach(track => {
          console.log(`  - ${track.kind} track: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
        });
        
        setParticipantStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(participantId, remoteStream);
          console.log('📊 Updated participant streams. Total:', newMap.size);
          return newMap;
        });

        // Attach to video element immediately
        setTimeout(() => {
          const videoElement = participantVideoRefs.current.get(participantId);
          if (videoElement) {
            videoElement.srcObject = remoteStream;
            videoElement.muted = false; // CRITICAL: Enable audio
            videoElement.volume = 1.0;
            
            // Ensure playback starts
            videoElement.play().then(() => {
              console.log('🎥 Video/Audio playing for', participantId);
            }).catch(error => {
              console.warn('⚠️ Autoplay blocked for', participantId, '- User interaction may be required');
            });
            
            console.log('🔊 Audio enabled for', participantId);
          } else {
            console.warn('⚠️ Video element not found for', participantId);
          }
        }, 100);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to', participantId);
        socket.emit('virtualClass:webrtc:iceCandidate', {
          classId,
          targetUserId: participantId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔗 Connection state with', participantId, ':', pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ Successfully connected to', participantId);
        toast.success(`Connected to ${participantId.substring(0, 8)}...`);
      } else if (pc.connectionState === 'failed') {
        console.error('❌ Connection failed with', participantId);
        toast.error(`Connection failed with ${participantId.substring(0, 8)}...`);
        // Attempt to reconnect
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect with', participantId);
          pc.close();
          setPeerConnections(prev => {
            const newMap = new Map(prev);
            newMap.delete(participantId);
            return newMap;
          });
          // Only impolite peer retries
          const isPolite = (user?.id || '') < participantId;
          if (!isPolite) {
            createOffer(participantId);
          }
        }, 3000);
      } else if (pc.connectionState === 'disconnected') {
        console.warn('⚠️ Disconnected from', participantId);
        toast.warning(`Disconnected from ${participantId.substring(0, 8)}...`);
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state with', participantId, ':', pc.iceConnectionState);
    };

    return pc;
  };

  // Create and send offer to participant
  const createOffer = async (participantId: string) => {
    try {
      console.log('📤 Creating offer for', participantId);
      
      if (!localStream) {
        console.error('❌ Cannot create offer: no local stream');
        return;
      }
      
      const pc = createPeerConnection(participantId);
      setPeerConnections(prev => new Map(prev).set(participantId, pc));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await pc.setLocalDescription(offer);

      socket.emit('virtualClass:webrtc:offer', {
        classId,
        targetUserId: participantId,
        offer,
      });

      console.log('✅ Offer sent to', participantId);
    } catch (error) {
      console.error('❌ Error creating offer for', participantId, ':', error);
    }
  };

  // Handle incoming offer
  const handleOffer = async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      console.log('📥 Received offer from', fromUserId);
      
      if (!localStream) {
        console.error('❌ Cannot handle offer: no local stream');
        return;
      }
      
      let pc = peerConnections.get(fromUserId);
      
      // Create peer connection if it doesn't exist
      if (!pc) {
        console.log('🆕 Creating peer connection for incoming offer from', fromUserId);
        pc = createPeerConnection(fromUserId);
        setPeerConnections(prev => new Map(prev).set(fromUserId, pc));
      }
      
      // Check if we need to handle collision (both sides sent offers)
      const isPolite = (user?.id || '') < fromUserId;
      const offerCollision = pc.signalingState !== 'stable';
      
      if (offerCollision) {
        console.log('⚠️ Offer collision detected with', fromUserId);
        if (!isPolite) {
          console.log('😎 Impolite - ignoring offer');
          return; // Impolite peer ignores offer
        }
        console.log('😊 Polite - rolling back and accepting offer');
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote description set for', fromUserId);
      
      // Process any queued ICE candidates
      const queuedCandidates = pendingIceCandidates.get(fromUserId);
      if (queuedCandidates && queuedCandidates.length > 0) {
        console.log('🧊 Processing', queuedCandidates.length, 'queued ICE candidates for', fromUserId);
        for (const candidate of queuedCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('❌ Error adding queued ICE candidate:', err);
          }
        }
        setPendingIceCandidates(prev => {
          const newMap = new Map(prev);
          newMap.delete(fromUserId);
          return newMap;
        });
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('virtualClass:webrtc:answer', {
        classId,
        targetUserId: fromUserId,
        answer,
      });

      console.log('✅ Answer sent to', fromUserId);
    } catch (error) {
      console.error('❌ Error handling offer from', fromUserId, ':', error);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      console.log('📥 Received answer from', fromUserId);
      
      const pc = peerConnections.get(fromUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Remote description set for', fromUserId);
        
        // Process any queued ICE candidates
        const queuedCandidates = pendingIceCandidates.get(fromUserId);
        if (queuedCandidates && queuedCandidates.length > 0) {
          console.log('🧊 Processing', queuedCandidates.length, 'queued ICE candidates for', fromUserId);
          for (const candidate of queuedCandidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error('❌ Error adding queued ICE candidate:', err);
            }
          }
          setPendingIceCandidates(prev => {
            const newMap = new Map(prev);
            newMap.delete(fromUserId);
            return newMap;
          });
        }
      } else {
        console.error('❌ No peer connection found for', fromUserId);
      }
    } catch (error) {
      console.error('❌ Error handling answer from', fromUserId, ':', error);
    }
  };

  // Handle incoming ICE candidate
  const handleIceCandidate = async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnections.get(fromUserId);
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('🧊 ICE candidate added for', fromUserId);
      } else if (pc) {
        // Queue candidate if remote description not set yet
        console.log('⏳ Queueing ICE candidate for', fromUserId, '(remote description not set)');
        setPendingIceCandidates(prev => {
          const newMap = new Map(prev);
          const queue = newMap.get(fromUserId) || [];
          queue.push(candidate);
          newMap.set(fromUserId, queue);
          return newMap;
        });
      } else {
        console.warn('⚠️ No peer connection found for ICE candidate from', fromUserId);
      }
    } catch (error) {
      console.error('❌ Error handling ICE candidate from', fromUserId, ':', error);
    }
  };

  // Update video element when local stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('📹 Video element updated with stream');
    }
  }, [localStream]);

  // Ensure video tracks are always enabled when toggling
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);

  // Ensure audio tracks are always enabled when toggling
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

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
  
  // Periodic connection health check
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      if (!virtualClass?.participants || !localStream) return;
      
      const activeParticipants = virtualClass.participants.filter(p => !p.leftAt && p.user._id !== user?.id);
      
      activeParticipants.forEach(participant => {
        const participantId = participant.user._id;
        const pc = peerConnections.get(participantId);
        
        if (!pc) {
          console.log('🏥 Health check: No connection with', participant.user.firstName, '- Creating...');
          const isPolite = (user?.id || '') < participantId;
          if (!isPolite) {
            createOffer(participantId);
          }
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          console.log('🏥 Health check: Connection failed with', participant.user.firstName, '- Reconnecting...');
          pc.close();
          peerConnections.delete(participantId);
          const isPolite = (user?.id || '') < participantId;
          if (!isPolite) {
            createOffer(participantId);
          }
        } else if (pc.connectionState === 'connected') {
          // Check if we're receiving media
          const hasStream = participantStreams.has(participantId);
          if (!hasStream) {
            console.log('🏥 Health check: Connected but no stream from', participant.user.firstName);
          }
        }
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(healthCheckInterval);
  }, [virtualClass?.participants, localStream, user?.id, peerConnections, participantStreams]);

  // Ensure remote participant audio is playing
  useEffect(() => {
    participantStreams.forEach((stream, participantId) => {
      const videoElement = participantVideoRefs.current.get(participantId);
      if (videoElement && stream) {
        videoElement.srcObject = stream;
        videoElement.muted = false;
        videoElement.volume = 1.0;
        
        // Play audio if paused
        videoElement.play().catch(error => {
          console.warn('⚠️ Could not auto-play audio for', participantId, ':', error);
        });
        
        console.log('🔊 Audio configured for participant:', participantId);
      }
    });
  }, [participantStreams]);

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
      console.log('👋 Participant joined:', data.participant.userName, data.participant.userId);
      fetchClassData(); // Refresh participant list
      toast.success(`${data.participant.userName} joined the class`);
      
      // Initiate WebRTC connection with new participant
      if (data.participant.userId !== user?.id && localStream) {
        const participantId = data.participant.userId;
        
        // Use polite/impolite pattern - user with lower ID is polite (waits for offer)
        const isPolite = (user?.id || '') < participantId;
        
        setTimeout(() => {
          if (isPolite) {
            console.log('😊 Being polite - waiting for offer from', data.participant.userName);
            // Polite peer waits for offer, but ensures peer connection exists
            if (!peerConnections.has(participantId)) {
              console.log('📝 Pre-creating peer connection for', data.participant.userName);
              const pc = createPeerConnection(participantId);
              setPeerConnections(prev => new Map(prev).set(participantId, pc));
            }
          } else {
            console.log('😎 Being impolite - creating offer for', data.participant.userName);
            createOffer(participantId);
          }
        }, 1500); // Give time for both sides to be ready
      }
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
      
      // The audio track enabled state is automatically handled by WebRTC
      // No need to manually update - the remote stream's audio track will reflect the change
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
      
      // The video track enabled state is automatically handled by WebRTC
      // The UI will show/hide video based on isVideoOff state
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
      console.log('🎨 Whiteboard update received from:', data.updatedBy);
      // Update whiteboard canvas in real-time
      if (canvasRef && data.whiteboardData) {
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            // Clear canvas first
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
            // Draw image scaled to canvas size
            ctx.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);
            console.log('✅ Whiteboard updated successfully');
          };
          img.onerror = (error) => {
            console.error('❌ Error loading whiteboard image:', error);
          };
          img.src = data.whiteboardData;
        } else {
          console.warn('⚠️ Canvas context not available');
        }
      } else {
        console.warn('⚠️ Canvas ref not available or no whiteboard data');
      }
    });

    // Listen for screen share start
    socket.on('virtualClass:screenShare:started', (data) => {
      console.log('🖥️ Screen share started event received:', data);
      console.log('🖥️ Setting screen share user ID to:', data.userId);
      console.log('🖥️ Current participant streams:', Array.from(participantStreams.keys()));
      setScreenShareUserId(data.userId);
      toast.info(`${data.userName} started sharing screen`);
    });

    // Listen for screen share stop
    socket.on('virtualClass:screenShare:stopped', (data) => {
      console.log('🖥️ Screen share stopped event received:', data);
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

    // Listen for speaking status
    socket.on('virtualClass:speaking', (data) => {
      setSpeakingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isSpeaking) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // WebRTC signaling listeners
    socket.on('virtualClass:webrtc:offer', (data) => {
      handleOffer(data.fromUserId, data.offer);
    });

    socket.on('virtualClass:webrtc:answer', (data) => {
      handleAnswer(data.fromUserId, data.answer);
    });

    socket.on('virtualClass:webrtc:iceCandidate', (data) => {
      handleIceCandidate(data.fromUserId, data.candidate);
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
      socket.off('virtualClass:speaking');
      socket.off('virtualClass:webrtc:offer');
      socket.off('virtualClass:webrtc:answer');
      socket.off('virtualClass:webrtc:iceCandidate');
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
      
      // After joining, initiate connections with existing participants
      setTimeout(() => {
        if (virtualClass?.participants) {
          virtualClass.participants
            .filter(p => !p.leftAt && p.user._id !== user?.id)
            .forEach(participant => {
              createOffer(participant.user._id);
            });
        }
      }, 2000);
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
    
    const messageData = {
      _id: `${Date.now()}-${user?.id}`,
      sender: {
        _id: user?.id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatar: user?.avatar || null,
      },
      message: chatMessage,
      timestamp: new Date().toISOString(),
      isPrivate: false,
    };
    
    // Add message to local state immediately for instant feedback
    setVirtualClass(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chatMessages: [...(prev.chatMessages || []), messageData],
      };
    });
    
    // Emit Socket.IO event (backend will broadcast to others)
    socket.emit('virtualClass:chat:send', {
      classId,
      message: chatMessage,
      isPrivate: false,
    });
    
    setChatMessage('');
    
    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
      
      // Throttle whiteboard updates for better performance
      const now = Date.now();
      if (classId && now - lastWhiteboardUpdate.current > whiteboardUpdateThrottle) {
        lastWhiteboardUpdate.current = now;
        const whiteboardData = canvas.toDataURL();
        socket.emit('virtualClass:whiteboard:update', {
          classId,
          whiteboardData,
        });
      }
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
        <div className={`${isScreenShareFullscreen ? 'fixed inset-0 z-50 bg-black' : 'fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-40 w-[95%] md:w-4/5 h-[70vh] md:h-3/4'} flex flex-col`}>
          <div className="bg-gray-900 p-2 md:p-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-white font-medium text-xs md:text-sm">
                {screenShareUserId === user?.id ? 'You are' : `${virtualClass.participants?.find(p => p.user._id === screenShareUserId)?.user.firstName || 'Someone'} is`} sharing screen
              </span>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsScreenShareFullscreen(!isScreenShareFullscreen)}
                className="text-white border-gray-600 hover:bg-gray-800 text-xs md:text-sm px-2 md:px-3">
                {isScreenShareFullscreen ? 'Exit' : 'Full'}
              </Button>
              {screenShareUserId !== user?.id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setScreenShareUserId(null);
                    setIsScreenShareFullscreen(false);
                  }}
                  className="text-white border-gray-600 hover:bg-gray-800 text-xs md:text-sm px-2 md:px-3">
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
            ) : screenShareUserId && participantStreams.has(screenShareUserId) ? (
              <video
                ref={(el) => {
                  if (el && screenShareUserId) {
                    const stream = participantStreams.get(screenShareUserId);
                    if (stream && el.srcObject !== stream) {
                      el.srcObject = stream;
                      el.play().catch(err => console.error('Error playing remote screen share:', err));
                    }
                  }
                }}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-white">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Viewing shared screen</p>
                <p className="text-sm text-gray-400 mt-2">Waiting for screen share stream...</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Top toolbar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-base md:text-lg font-semibold truncate max-w-[200px] md:max-w-none">{virtualClass.title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[200px] md:max-w-none">
              {virtualClass.course?.courseCode} - {virtualClass.course?.courseName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white animate-pulse">
            ● LIVE
          </span>
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
            {virtualClass.participants?.filter(p => !p.leftAt).length || 0} participants
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Video grid */}
        <div className="flex-1 p-2 md:p-4 overflow-auto bg-gray-900">
          <div className={`grid gap-2 md:gap-4 h-full ${
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'
          }`}>
            {/* Local user video (always show first) */}
            {user && (
              <Card key={user.id} className={`relative aspect-video bg-gray-800 border-gray-700 overflow-hidden ${
                speakingUsers.has(user.id) ? 'ring-4 ring-green-500 ring-opacity-75' : ''
              }`}>
                {/* Video element - always render, track.enabled controls visibility */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoOff ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                
                {/* Avatar overlay when video is off */}
                {isVideoOff && (
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
                  {!isMuted && speakingUsers.has(user.id) && (
                    <div className="bg-green-500 rounded-full p-1.5 animate-pulse">
                      <Mic className="w-3 h-3 text-white" />
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
            {virtualClass.participants?.filter(p => !p.leftAt && p.user._id !== user?.id).map((participant) => {
              const participantStream = participantStreams.get(participant.user._id);
              
              return (
                <Card key={participant.user._id} className={`relative aspect-video bg-gray-800 border-gray-700 overflow-hidden ${
                  speakingUsers.has(participant.user._id) ? 'ring-4 ring-green-500 ring-opacity-75' : ''
                }`}>
                  {/* Video element - always render if stream exists, track.enabled controls visibility */}
                  {participantStream && (
                    <video
                      ref={(el) => {
                        if (el) {
                          participantVideoRefs.current.set(participant.user._id, el);
                          if (participantStream) {
                            el.srcObject = participantStream;
                            // Ensure audio plays
                            el.muted = false;
                            el.volume = 1.0;
                            console.log('🔊 Audio enabled for', participant.user.firstName);
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      muted={false}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        participant.isVideoOff ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  )}
                  
                  {/* Avatar overlay - show when no stream or video is off */}
                  {(!participantStream || participant.isVideoOff) && (
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
                  )}
                  
                  {/* Status indicators */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {participant.isMuted && (
                      <div className="bg-red-500 rounded-full p-1.5">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {!participant.isMuted && speakingUsers.has(participant.user._id) && (
                      <div className="bg-green-500 rounded-full p-1.5 animate-pulse">
                        <Mic className="w-3 h-3 text-white" />
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
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div className={`${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed lg:relative inset-y-0 right-0 z-30 w-full sm:w-96 lg:w-80 border-l border-border flex flex-col bg-card transition-transform duration-300 ease-in-out lg:translate-x-0`}>
          {/* Close button for mobile */}
          <div className="lg:hidden absolute top-2 left-2 z-10">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="bg-background/80 backdrop-blur-sm">
              ✕
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => { setShowChat(true); setShowParticipants(false); setShowPolls(false); setShowWhiteboard(false); }}
              className={`flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors ${showChat ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />Chat
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(true); setShowPolls(false); setShowWhiteboard(false); }}
              className={`flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors ${showParticipants ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <Users className="w-4 h-4 mx-auto mb-1" />People
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(false); setShowPolls(true); setShowWhiteboard(false); }}
              className={`flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors ${showPolls ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
              <BarChart3 className="w-4 h-4 mx-auto mb-1" />Polls
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(false); setShowPolls(false); setShowWhiteboard(true); }}
              className={`flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors ${showWhiteboard ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
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
                    <div key={participant.user._id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors ${
                      speakingUsers.has(participant.user._id) ? 'bg-green-500/10 ring-2 ring-green-500/50' : ''
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{participant.user.firstName?.[0]}{participant.user.lastName?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.user.firstName} {participant.user.lastName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
                      </div>
                      {participant.isHandRaised && <Hand className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      {participant.isMuted ? (
                        <MicOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                      ) : speakingUsers.has(participant.user._id) ? (
                        <Mic className="w-4 h-4 text-green-500 flex-shrink-0 animate-pulse" />
                      ) : null}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsWhiteboardFullscreen(!isWhiteboardFullscreen)}
                      title={isWhiteboardFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                      {isWhiteboardFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
                <canvas 
                  ref={(el) => setCanvasRef(el)}
                  width={isWhiteboardFullscreen ? window.innerWidth - 40 : 280} 
                  height={isWhiteboardFullscreen ? window.innerHeight - 150 : 400}
                  className={`border border-border rounded-lg bg-white ${isHost ? 'cursor-crosshair' : 'cursor-default'} ${isWhiteboardFullscreen ? 'flex-1' : ''}`}
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
      <div className="bg-card border-t border-border px-2 md:px-4 py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        <Button variant={isMuted ? 'destructive' : 'outline'} size="lg" onClick={() => {
          const newMutedState = !isMuted;
          setIsMuted(newMutedState);
          
          console.log('🎤 Toggling audio:', newMutedState ? 'MUTED' : 'UNMUTED');
          
          // Toggle audio track enabled state (don't stop/start the track)
          if (localStream) {
            localStream.getAudioTracks().forEach(track => {
              track.enabled = !newMutedState;
              console.log('🎤 Audio track enabled:', track.enabled);
            });
          }
          
          // No need to update peer connections - track enabled state is automatically reflected
          
          socket.emit('virtualClass:toggleAudio', { classId, isMuted: newMutedState });
        }}
          className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0">
          {isMuted ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
        </Button>
        <Button variant={isVideoOff ? 'destructive' : 'outline'} size="lg" onClick={() => {
          const newVideoState = !isVideoOff;
          setIsVideoOff(newVideoState);
          
          console.log('📹 Toggling video:', newVideoState ? 'OFF' : 'ON');
          
          // Toggle video track enabled state (don't stop/start the track)
          if (localStream) {
            localStream.getVideoTracks().forEach(track => {
              track.enabled = !newVideoState;
              console.log('📹 Video track enabled:', track.enabled);
            });
          }
          
          // No need to update peer connections - track enabled state is automatically reflected
          
          socket.emit('virtualClass:toggleVideo', { classId, isVideoOff: newVideoState });
        }}
          className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0">
          {isVideoOff ? <VideoOff className="w-4 h-4 md:w-5 md:h-5" /> : <Video className="w-4 h-4 md:w-5 md:h-5" />}
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
                
                // Add screen share track to all existing peer connections
                const screenTrack = stream.getVideoTracks()[0];
                
                console.log('🖥️ Screen sharing started, adding to peer connections...');
                console.log('🖥️ Screen track details:', {
                  id: screenTrack.id,
                  kind: screenTrack.kind,
                  enabled: screenTrack.enabled,
                  readyState: screenTrack.readyState
                });
                
                peerConnections.forEach((pc, participantId) => {
                  // Find and replace the video sender with screen share
                  const senders = pc.getSenders();
                  const videoSender = senders.find(sender => sender.track?.kind === 'video');
                  
                  if (videoSender) {
                    console.log('🔄 Replacing video track with screen share for', participantId);
                    videoSender.replaceTrack(screenTrack).then(() => {
                      console.log('✅ Screen share track added to peer connection with', participantId);
                    }).catch(error => {
                      console.error('❌ Error adding screen share track to', participantId, ':', error);
                    });
                  } else {
                    console.warn('⚠️ No video sender found for', participantId);
                  }
                });
                
                // Listen for when user stops sharing via browser UI
                screenTrack.onended = () => {
                  console.log('🖥️ Screen sharing ended by user');
                  
                  // Restore camera video track
                  if (localStream) {
                    const cameraTrack = localStream.getVideoTracks()[0];
                    peerConnections.forEach((pc, participantId) => {
                      const senders = pc.getSenders();
                      const videoSender = senders.find(sender => sender.track?.kind === 'video');
                      
                      if (videoSender && cameraTrack) {
                        videoSender.replaceTrack(cameraTrack).then(() => {
                          console.log('✅ Camera track restored for', participantId);
                        });
                      }
                    });
                  }
                  
                  setScreenStream(null);
                  setIsScreenSharing(false);
                  setScreenShareUserId(null);
                  socket.emit('virtualClass:screenShare:stop', { classId });
                  toast.info('Screen sharing stopped');
                };
                
                socket.emit('virtualClass:screenShare:start', { classId });
                toast.success('Screen sharing started');
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
              console.log('🖥️ Stopping screen share...');
              
              // Restore camera video track to all peer connections
              if (localStream) {
                const cameraTrack = localStream.getVideoTracks()[0];
                peerConnections.forEach((pc, participantId) => {
                  const senders = pc.getSenders();
                  const videoSender = senders.find(sender => sender.track?.kind === 'video');
                  
                  if (videoSender && cameraTrack) {
                    videoSender.replaceTrack(cameraTrack).then(() => {
                      console.log('✅ Camera track restored for', participantId);
                    });
                  }
                });
              }
              
              if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
                setScreenStream(null);
              }
              setIsScreenSharing(false);
              setScreenShareUserId(null);
              socket.emit('virtualClass:screenShare:stop', { classId });
              toast.info('Screen sharing stopped');
            }
          }}
            className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0">
            {isScreenSharing ? <MonitorOff className="w-4 h-4 md:w-5 md:h-5" /> : <Monitor className="w-4 h-4 md:w-5 md:h-5" />}
          </Button>
        )}
        
        {/* Raise Hand - Students Only */}
        {isStudent && (
          <Button variant={isHandRaised ? 'default' : 'outline'} size="lg" onClick={handleRaiseHand}
            className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0">
            <Hand className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        )}
        
        <Button variant="outline" size="lg" onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
          className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0">
          {viewMode === 'grid' ? <Maximize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Grid3x3 className="w-4 h-4 md:w-5 md:h-5" />}
        </Button>
        
        {/* Faculty: Pause, Minimize, and End Class Buttons */}
        {isHost && (
          <div className="ml-auto flex gap-2 flex-wrap">
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
