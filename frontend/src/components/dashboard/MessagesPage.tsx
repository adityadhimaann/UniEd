import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Circle, ArrowLeft, Mail, User as UserIcon, Shield, BookOpen, Image as ImageIcon, Camera, File, X, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import messageService, { Conversation, Message, FacultyByCourse } from "@/services/messageService";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const chatVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const messageInputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] },
  },
};

export function MessagesPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [facultyByCourse, setFacultyByCourse] = useState<FacultyByCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [viewerFileUrl, setViewerFileUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Load conversations on mount
  useEffect(() => {
    if (isStudent) {
      loadFacultyByCourse();
    } else {
      loadConversations();
    }
  }, [isStudent]);

  // Socket.IO listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    // Join chat room
    socket.emit('join:chat');

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      // Only add message if it's from the other person (not from us)
      if (selectedConversation && 
          message.sender._id === selectedConversation.user._id &&
          message.sender._id !== user?.id) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      } else if (message.sender._id !== user?.id) {
        // Show notification for messages from other users when not in their chat
        toast.info(`New message from ${message.sender.firstName} ${message.sender.lastName}`, {
          duration: 3000,
        });
      }
    };

    socket.on('new:message', handleNewMessage);

    // Listen for online/offline status
    socket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
      socket.off('new:message', handleNewMessage);
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [selectedConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      setShowAttachmentMenu(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      setStream(mediaStream);
      setShowCamera(true);
      setShowAttachmentMenu(false);
      
      // Wait for dialog to render, then set video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File-like object from blob
            const file = new Blob([blob], { type: 'image/jpeg' });
            // Add file properties
            Object.defineProperty(file, 'name', {
              value: `capture-${Date.now()}.jpg`,
              writable: false
            });
            Object.defineProperty(file, 'lastModified', {
              value: Date.now(),
              writable: false
            });
            
            setSelectedFile(file as File);
            setFilePreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacultyByCourse = async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getFacultyByCourse();
      setFacultyByCourse(data);
    } catch (error: any) {
      console.error('Failed to load faculty:', error);
      // If it's a 403 error (not a student), just show empty state
      if (error.response?.status !== 403) {
        toast.error('Failed to load instructors');
      }
      setFacultyByCourse([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      setMessagesLoading(true);
      const data = await messageService.getMessages(otherUserId);
      setMessages(data.messages);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || isSending) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setNewMessage("");
    setIsSending(true);

    let fileUrl = null;
    let fileType = null;

    try {
      // Upload file if present
      if (selectedFile) {
        toast.info('Uploading file...');
        fileUrl = await uploadFile(selectedFile);
        
        // Determine file type
        if (selectedFile.type.startsWith('image/')) {
          fileType = 'image';
        } else if (selectedFile.type.startsWith('video/')) {
          fileType = 'video';
        } else if (selectedFile.type.startsWith('audio/')) {
          fileType = 'audio';
        } else if (selectedFile.type.includes('pdf') || selectedFile.type.includes('document')) {
          fileType = 'document';
        } else {
          fileType = 'other';
        }
        
        clearFile();
      }

      // Optimistically add message to UI
      const optimisticMessage: any = {
        _id: tempId,
        sender: {
          _id: user!.id,
          firstName: user!.firstName,
          lastName: user!.lastName,
          email: user!.email,
          avatar: user?.avatar,
        },
        content: content || (fileUrl ? '📎 File attachment' : ''),
        fileUrl,
        fileType,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();

      // Send message via HTTP (backend will handle Socket.IO broadcast)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          receiverId: selectedConversation.user._id,
          content: content || '',
          fileUrl,
          fileType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      const message = result.data;

      // Replace temp message with real message
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...message, sender: optimisticMessage.sender } : m
      ));

    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove failed message
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setNewMessage(content); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationClick = async (facultyUser: any) => {
    const conversation: Conversation = {
      _id: facultyUser._id,
      user: facultyUser,
      lastMessage: null,
      unreadCount: 0,
      lastMessageTime: new Date().toISOString(),
    };
    
    setSelectedConversation(conversation);
    setShowChat(true);
    await loadMessages(facultyUser._id);
    
    // Mark as read
    try {
      await messageService.markAsRead(facultyUser._id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'h:mm a');
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Deduplicate faculty by faculty ID and group courses
  const uniqueFacultyMap = new Map<string, { faculty: any; courses: Array<{ courseId: string; courseName: string; courseCode: string }> }>();
  
  facultyByCourse.forEach(item => {
    if (uniqueFacultyMap.has(item.faculty._id)) {
      // Add course to existing faculty entry
      uniqueFacultyMap.get(item.faculty._id)!.courses.push({
        courseId: item.courseId,
        courseName: item.courseName,
        courseCode: item.courseCode,
      });
    } else {
      // Create new faculty entry
      uniqueFacultyMap.set(item.faculty._id, {
        faculty: item.faculty,
        courses: [{
          courseId: item.courseId,
          courseName: item.courseName,
          courseCode: item.courseCode,
        }],
      });
    }
  });

  const filteredFaculty = Array.from(uniqueFacultyMap.values()).filter(item =>
    (selectedCourse === "" || item.courses.some(c => c.courseId === selectedCourse)) &&
    (item.faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.faculty.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.courses.some(c => c.courseName.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const isOnline = (userId: string) => onlineUsers.has(userId);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)]"
    >
      <div className="glass rounded-xl border border-border/50 h-full flex overflow-hidden relative">
        {/* Conversations sidebar */}
        <div className={`w-full md:w-96 border-r border-border/50 flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            
            {/* Course filter for students */}
            {isStudent && facultyByCourse.length > 0 && (
              <div className="mb-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Courses</option>
                  {[...new Set(facultyByCourse.map(f => f.courseId))].map(courseId => {
                    const course = facultyByCourse.find(f => f.courseId === courseId);
                    return (
                      <option key={courseId} value={courseId}>
                        {course?.courseCode} - {course?.courseName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-8 text-center">
                <img src="/loadicon.gif" alt="Loading" className="h-16 w-16 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            ) : isStudent ? (
              // Student view - show faculty by course
              filteredFaculty.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery || selectedCourse ? 'No instructors found' : 'No enrolled courses yet. Enroll in courses to chat with instructors!'}
                </div>
              ) : (
                <div className="p-2">
                  {filteredFaculty.map((item) => (
                    <motion.button
                      key={item.faculty._id}
                      variants={itemVariants}
                      onClick={() => handleConversationClick(item.faculty)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedConversation?.user._id === item.faculty._id
                          ? "bg-primary/10"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={item.faculty.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {item.faculty.firstName?.[0] || item.faculty.email?.[0]?.toUpperCase() || 'U'}
                            {item.faculty.lastName?.[0] || item.faculty.email?.[1]?.toUpperCase() || ''}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline(item.faculty._id) && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-success text-success" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{item.faculty.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">
                            {item.courses.length === 1 
                              ? item.courses[0].courseCode
                              : `${item.courses.length} courses`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 truncate">
                          {item.courses.length === 1 
                            ? item.courses[0].courseName
                            : item.courses.map(c => c.courseCode).join(', ')}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )
            ) : (
              // Faculty/Admin view - show all conversations
              filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <motion.button
                      key={conversation._id}
                      variants={itemVariants}
                      onClick={() => handleConversationClick(conversation.user)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedConversation?._id === conversation._id
                          ? "bg-primary/10"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {conversation.user.firstName?.[0] || conversation.user.email?.[0]?.toUpperCase() || 'U'}
                            {conversation.user.lastName?.[0] || conversation.user.email?.[1]?.toUpperCase() || ''}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline(conversation.user._id) && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-success text-success" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{conversation.user.name}</span>
                          {conversation.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage || 'Start a conversation'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className={`w-full md:w-auto flex-1 flex-col md:flex ${showChat ? 'flex absolute inset-0 md:relative z-10' : 'hidden'} glass`}>
          {selectedConversation ? (
            <motion.div 
              key={selectedConversation._id}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              {/* Chat header */}
              <motion.div 
                variants={chatVariants}
                className="p-4 border-b border-border/50 flex items-center justify-between shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setShowChat(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {selectedConversation.user.firstName?.[0] || selectedConversation.user.email?.[0]?.toUpperCase() || 'U'}
                      {selectedConversation.user.lastName?.[0] || selectedConversation.user.email?.[1]?.toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.user.name}</h3>
                    <span className="text-xs text-muted-foreground capitalize">
                      {isOnline(selectedConversation.user._id) ? "Online" : "Offline"} • {selectedConversation.user.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                        <UserIcon className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>

              {/* Messages */}
              <motion.div variants={chatVariants} className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <img 
                        src="/loadicon.gif" 
                        alt="Loading" 
                        className="h-20 w-20"
                      />
                      <p className="text-muted-foreground text-sm mt-4">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message: any) => {
                      const isMe = message.sender._id === user?.id || message.sender._id.toString() === user?.id;
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl ${
                              isMe
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-sm"
                                : "bg-secondary rounded-bl-sm"
                            }`}
                          >
                            {message.fileUrl && message.fileType === 'image' && (
                              <div className="relative group">
                                <img 
                                  src={message.fileUrl} 
                                  alt="Attachment" 
                                  className="rounded-t-2xl max-w-xs h-auto"
                                />
                                {/* Overlay with icons */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl flex items-center justify-center gap-3">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-white/20 hover:bg-white/30 text-white"
                                    onClick={() => {
                                      setViewerImageUrl(message.fileUrl);
                                      setShowImageViewer(true);
                                    }}
                                  >
                                    <Eye className="w-5 h-5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-white/20 hover:bg-white/30 text-white"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = message.fileUrl;
                                      link.download = 'image.jpg';
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                  >
                                    <Download className="w-5 h-5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {message.fileUrl && message.fileType !== 'image' && (
                              <div className="p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <File className="w-5 h-5" />
                                  <span className="text-sm">File Attachment</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 ${isMe ? 'hover:bg-white/20' : 'hover:bg-secondary'}`}
                                    onClick={() => {
                                      setViewerFileUrl(message.fileUrl);
                                      setShowFileViewer(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 ${isMe ? 'hover:bg-white/20' : 'hover:bg-secondary'}`}
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = message.fileUrl;
                                      link.download = 'file';
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {message.content && (
                              <p className="text-sm p-3">{message.content}</p>
                            )}
                            <span className={`text-xs px-3 pb-2 block ${
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[70%] p-3 rounded-2xl bg-gradient-to-r from-primary/50 to-accent/50 text-primary-foreground rounded-br-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-xs">Sending...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              </motion.div>

              {/* Message input */}
              <motion.div 
                variants={messageInputVariants}
                className="p-4 border-t border-border/50 shrink-0"
              >
                {/* File Preview */}
                {(filePreview || selectedFile) && (
                  <div className="mb-3 p-3 bg-secondary/50 rounded-lg flex items-center gap-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
                    ) : (
                      <div className="h-20 w-20 bg-secondary rounded flex items-center justify-center">
                        <File className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearFile}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    {/* Attachment Menu */}
                    {showAttachmentMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-md transition-colors text-left"
                        >
                          <ImageIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm">Send Picture</span>
                        </button>
                        <button
                          onClick={startCamera}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-md transition-colors text-left"
                        >
                          <Camera className="w-4 h-4 text-primary" />
                          <span className="text-sm">Capture Image</span>
                        </button>
                        <button
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = '*/*';
                              fileInputRef.current.click();
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-md transition-colors text-left"
                        >
                          <File className="w-4 h-4 text-primary" />
                          <span className="text-sm">Send File</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-secondary/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isSending}
                  />
                  <Button 
                    size="icon" 
                    className="bg-gradient-to-r from-primary to-accent"
                    disabled={(!newMessage.trim() && !selectedFile) || isSending}
                    onClick={handleSendMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedConversation && (
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center gap-4 pb-4 border-b border-border/50">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedConversation.user.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {selectedConversation.user.firstName?.[0]}{selectedConversation.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedConversation.user.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {isOnline(selectedConversation.user._id) && (
                      <Circle className="w-2 h-2 fill-success text-success" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {isOnline(selectedConversation.user._id) ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedConversation.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{selectedConversation.user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capture Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={captureImage} className="bg-gradient-to-r from-primary to-accent">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0" hideClose>
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  if (viewerImageUrl) {
                    const link = document.createElement('a');
                    link.href = viewerImageUrl;
                    link.download = 'image.jpg';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setShowImageViewer(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {viewerImageUrl && (
              <img
                src={viewerImageUrl}
                alt="Full size"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Viewer Dialog */}
      <Dialog open={showFileViewer} onOpenChange={setShowFileViewer}>
        <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0" hideClose>
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <DialogTitle>File Viewer</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (viewerFileUrl) {
                    window.open(viewerFileUrl, '_blank');
                  }
                }}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Eye className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewerFileUrl) {
                    const link = document.createElement('a');
                    link.href = viewerFileUrl;
                    link.download = 'file';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFileViewer(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-secondary/20 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">File Ready to View</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Click "Open in New Tab" to view the file, or download it to your device.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    if (viewerFileUrl) {
                      window.open(viewerFileUrl, '_blank');
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (viewerFileUrl) {
                      const link = document.createElement('a');
                      link.href = viewerFileUrl;
                      link.download = 'file';
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
