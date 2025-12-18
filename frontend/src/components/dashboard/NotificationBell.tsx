import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
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
    // Poll for new notifications every 10 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
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

    // Navigate based on notification type
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
    switch (type) {
      case "enrollment-request":
        return "📝";
      case "enrollment-response":
        return "✅";
      case "assignment":
        return "📚";
      case "grade":
        return "📊";
      case "announcement":
        return "📢";
      case "message":
        return "💬";
      default:
        return "🔔";
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
              className="absolute right-0 mt-2 w-96 z-50"
            >
              <Card className="glass border-border/50 shadow-lg">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <CardContent className="p-0">
                    {!notifications || notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {(notifications || []).map((notification) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                              !notification.isRead ? "bg-accent/20" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              <div className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
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
