import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Circle, ArrowLeft, Mail, User as UserIcon, Shield, BookOpen } from "lucide-react";
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
  const [isSending, setIsSending] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
          message.sender._id !== user?._id) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
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
      const data = await messageService.getMessages(otherUserId);
      setMessages(data.messages);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setNewMessage("");
    setIsSending(true);

    // Optimistically add message to UI
    const optimisticMessage: Message = {
      _id: tempId,
      sender: {
        _id: user!._id,
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
        avatar: user?.avatar,
      },
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      // Send message via HTTP (backend will handle Socket.IO broadcast)
      const message = await messageService.sendMessage(
        selectedConversation.user._id,
        content
      );

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
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.sender._id === user?._id;
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-2xl ${
                              isMe
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-sm"
                                : "bg-secondary rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className={`text-xs mt-1 block ${
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
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
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
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
                    disabled={!newMessage.trim() || isSending}
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
    </motion.div>
  );
}
