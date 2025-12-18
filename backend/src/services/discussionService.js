import Discussion from '../models/Discussion.js';
import ApiError from '../utils/ApiError.js';
import { sendNotification, broadcastToClass } from '../socket/socketHandler.js';
import Notification from '../models/Notification.js';
import Enrollment from '../models/Enrollment.js';

class DiscussionService {
  // Create a new discussion
  async createDiscussion(discussionData, authorId) {
    const discussion = await Discussion.create({
      ...discussionData,
      author: authorId,
    });

    await discussion.populate('author', 'firstName lastName email avatar');

    // Notify enrolled students
    const enrollments = await Enrollment.find({ 
      course: discussion.course, 
      status: 'active' 
    });

    for (const enrollment of enrollments) {
      if (enrollment.student.toString() !== authorId.toString()) {
        const notification = await Notification.create({
          user: enrollment.student,
          type: 'discussion',
          title: 'New Discussion',
          message: `New discussion: "${discussion.title}"`,
          metadata: {
            discussionId: discussion._id,
            courseId: discussion.course,
          },
        });

        sendNotification(enrollment.student.toString(), notification);
      }
    }

    // Broadcast to class
    broadcastToClass(discussion.course.toString(), 'new:discussion', {
      discussion,
    });

    return discussion;
  }

  // Get all discussions for a course
  async getCourseDiscussions(courseId, filters = {}) {
    const query = { course: courseId };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'firstName lastName email avatar role')
      .populate('replies.author', 'firstName lastName email avatar role')
      .sort({ isPinned: -1, createdAt: -1 });

    return discussions;
  }

  // Get discussion by ID
  async getDiscussionById(discussionId) {
    const discussion = await Discussion.findById(discussionId)
      .populate('author', 'firstName lastName email avatar role')
      .populate('replies.author', 'firstName lastName email avatar role')
      .populate('likes', 'firstName lastName email avatar')
      .populate('replies.likes', 'firstName lastName email avatar');

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    return discussion;
  }

  // Update discussion
  async updateDiscussion(discussionId, updates, userId) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    if (discussion.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own discussions');
    }

    if (discussion.isLocked) {
      throw ApiError.forbidden('This discussion is locked');
    }

    Object.assign(discussion, updates);
    discussion.isEdited = true;
    await discussion.save();

    return discussion;
  }

  // Delete discussion
  async deleteDiscussion(discussionId, userId, userRole) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    // Only author or instructor can delete
    if (discussion.author.toString() !== userId.toString() && 
        userRole !== 'faculty' && userRole !== 'admin') {
      throw ApiError.forbidden('You do not have permission to delete this discussion');
    }

    await discussion.deleteOne();
    return { message: 'Discussion deleted successfully' };
  }

  // Add reply to discussion
  async addReply(discussionId, replyData, authorId) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    if (discussion.isLocked) {
      throw ApiError.forbidden('This discussion is locked');
    }

    const reply = {
      author: authorId,
      content: replyData.content,
      attachments: replyData.attachments || [],
    };

    discussion.replies.push(reply);
    await discussion.save();

    await discussion.populate('replies.author', 'firstName lastName email avatar role');

    // Notify discussion author
    if (discussion.author.toString() !== authorId.toString()) {
      const notification = await Notification.create({
        user: discussion.author,
        type: 'discussion-reply',
        title: 'New Reply',
        message: `Someone replied to your discussion: "${discussion.title}"`,
        metadata: {
          discussionId: discussion._id,
          replyId: reply._id,
        },
      });

      sendNotification(discussion.author.toString(), notification);
    }

    // Broadcast to class
    broadcastToClass(discussion.course.toString(), 'discussion:reply', {
      discussionId: discussion._id,
      reply: discussion.replies[discussion.replies.length - 1],
    });

    return discussion.replies[discussion.replies.length - 1];
  }

  // Update reply
  async updateReply(discussionId, replyId, content, userId) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    const reply = discussion.replies.id(replyId);

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    if (reply.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own replies');
    }

    reply.content = content;
    reply.isEdited = true;
    await discussion.save();

    return reply;
  }

  // Delete reply
  async deleteReply(discussionId, replyId, userId, userRole) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    const reply = discussion.replies.id(replyId);

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    // Only author or instructor can delete
    if (reply.author.toString() !== userId.toString() && 
        userRole !== 'faculty' && userRole !== 'admin') {
      throw ApiError.forbidden('You do not have permission to delete this reply');
    }

    reply.deleteOne();
    await discussion.save();

    return { message: 'Reply deleted successfully' };
  }

  // Toggle like on discussion
  async toggleLike(discussionId, userId) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    const likeIndex = discussion.likes.indexOf(userId);

    if (likeIndex > -1) {
      discussion.likes.splice(likeIndex, 1);
    } else {
      discussion.likes.push(userId);
    }

    await discussion.save();

    return {
      liked: likeIndex === -1,
      likeCount: discussion.likes.length,
    };
  }

  // Toggle like on reply
  async toggleReplyLike(discussionId, replyId, userId) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    const reply = discussion.replies.id(replyId);

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    const likeIndex = reply.likes.indexOf(userId);

    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(userId);
    }

    await discussion.save();

    return {
      liked: likeIndex === -1,
      likeCount: reply.likes.length,
    };
  }

  // Pin/unpin discussion (instructor only)
  async togglePin(discussionId, userId, userRole) {
    if (userRole !== 'faculty' && userRole !== 'admin') {
      throw ApiError.forbidden('Only instructors can pin discussions');
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    return discussion;
  }

  // Lock/unlock discussion (instructor only)
  async toggleLock(discussionId, userId, userRole) {
    if (userRole !== 'faculty' && userRole !== 'admin') {
      throw ApiError.forbidden('Only instructors can lock discussions');
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw ApiError.notFound('Discussion not found');
    }

    discussion.isLocked = !discussion.isLocked;
    await discussion.save();

    return discussion;
  }
}

export default new DiscussionService();
