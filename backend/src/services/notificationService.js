import Notification from '../models/Notification.js';
import { sendNotification } from '../socket/socketHandler.js';

class NotificationService {
  async createNotification(userId, type, title, content, link = null) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        content,
        link,
      });

      // Send real-time notification via Socket.io
      sendNotification(userId, {
        _id: notification._id,
        type,
        title,
        content,
        link,
        isRead: false,
        createdAt: notification.createdAt,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async notifyAssignment(studentIds, assignment, course) {
    const notifications = studentIds.map((studentId) =>
      this.createNotification(
        studentId,
        'assignment',
        'New Assignment Posted',
        `New assignment "${assignment.title}" in ${course.courseName}. Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
        `/assignments/${assignment._id}`
      )
    );

    return Promise.all(notifications);
  }

  async notifyGrade(studentId, course, grade) {
    return this.createNotification(
      studentId,
      'grade',
      'Grade Published',
      `Your grade for ${course.courseName} has been published: ${grade.grade} (${grade.percentage.toFixed(1)}%)`,
      `/grades`
    );
  }

  async notifyAnnouncement(userIds, announcement) {
    const notifications = userIds.map((userId) =>
      this.createNotification(
        userId,
        'announcement',
        announcement.title,
        announcement.content,
        `/announcements/${announcement._id}`
      )
    );

    return Promise.all(notifications);
  }

  async notifyMessage(receiverId, sender, subject) {
    return this.createNotification(
      receiverId,
      'message',
      'New Message',
      `You received a message from ${sender.getFullName()}: ${subject}`,
      `/messages`
    );
  }

  async getUserNotifications(userId, unreadOnly = false) {
    const query = { user: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    return Notification.find(query).sort({ createdAt: -1 }).limit(50);
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  }

  async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, user: userId });
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ user: userId, isRead: false });
  }
}

export default new NotificationService();
