import { useState, useEffect } from "react";
import { Bell, FileText, CheckCircle, TrendingUp, MessageSquare, UserPlus, UserCheck, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket, emitEvent, onEvent, offEvent } from "@/lib/socket";
import { toast as sonnerToast } from "sonner";

interface Notification {
  _id: string;
  type: string;
  title: string;
  content: string;
  message?: string; // For backward compatibility
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Determine the API base path based on user role
  const getApiBasePath = () => {
    if (user?.role === 'faculty' || user?.role === 'admin') {
      return '/instructor';
    }
    return '/student';
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up socket connection for real-time notifications
    const socket = getSocket();
    
    if (socket) {
      // Join notifications room
      emitEvent('join:notifications');
      
      // Listen for new notifications
      const handleNewNotification = (notification: any) => {
        console.log('📢 New notification received:', notification);
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        sonnerToast.info(notification.title, {
          description: notification.content,
          duration: 5000,
        });
      };
      
      onEvent('new:notification', handleNewNotification);
      
      // Cleanup
      return () => {
        offEvent('new:notification', handleNewNotification);
        emitEvent('leave:notifications');
      };
    } else {
      // Fallback to polling if socket not available
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const basePath = getApiBasePath();
      const response = await api.get(`${basePath}/notifications?limit=10`);
      
      // Handle different response structures
      const data = response.data?.data || response.data;
      
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        const basePath = getApiBasePath();
        await api.patch(`${basePath}/notifications/${notification._id}/read`);
        setNotifications(
          (notifications || []).map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate based on notification link or type
    if (notification.link) {
      window.location.href = notification.link;
    } else {
      // Fallback to metadata-based navigation
      const metadata = notification.metadata;
      if (metadata) {
        if (notification.type === 'assignment' && metadata.courseId) {
          window.location.href = `/dashboard/assignments`;
        } else if (notification.type === 'enrollment-request' && metadata.courseId) {
          window.location.href = `/instructor/courses`;
        } else if (notification.type === 'enrollment-response' && metadata.courseId) {
          window.location.href = `/dashboard/courses`;
        } else if (notification.type === 'grade' && metadata.courseId) {
          window.location.href = `/dashboard/grades`;
        } else if (notification.type === 'announcement' && metadata.courseId) {
          window.location.href = `/dashboard`;
        }
      }
    }
    
    setIsOpen(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const basePath = getApiBasePath();
      await api.patch(`${basePath}/notifications/${notificationId}/read`);
      setNotifications(
        (notifications || []).map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const basePath = getApiBasePath();
      await api.patch(`${basePath}/notifications/mark-all-read`);
      setNotifications((notifications || []).map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-6 w-6";
    switch (type) {
      case "enrollment-request":
        return <UserPlus className={`${iconClass} text-blue-500`} />;
      case "enrollment-response":
        return <UserCheck className={`${iconClass} text-green-500`} />;
      case "assignment":
        return <FileText className={`${iconClass} text-purple-500`} />;
      case "grade":
        return <TrendingUp className={`${iconClass} text-orange-500`} />;
      case "submission-reviewed":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "announcement":
        return <Megaphone className={`${iconClass} text-red-500`} />;
      case "message":
        return <MessageSquare className={`${iconClass} text-blue-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed right-2 sm:absolute sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-96 z-50"
            >
              {/* Arrow pointer */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
              
              <Card className="bg-white border-gray-200 shadow-lg rounded-xl overflow-hidden relative">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <CardContent className="p-0">
                    {!notifications || notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {(notifications || []).map((notification) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.isRead ? "bg-blue-50" : "bg-white"
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.content || notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
