import discussionService from '../services/discussionService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class DiscussionController {
  // Create discussion
  createDiscussion = asyncHandler(async (req, res) => {
    const discussion = await discussionService.createDiscussion(
      req.body,
      req.user._id
    );
    return ApiResponse.created(res, discussion, 'Discussion created successfully');
  });

  // Get course discussions
  getCourseDiscussions = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { category, tags } = req.query;
    const discussions = await discussionService.getCourseDiscussions(courseId, {
      category,
      tags: tags ? tags.split(',') : undefined,
    });
    return ApiResponse.success(res, discussions);
  });

  // Get discussion by ID
  getDiscussionById = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const discussion = await discussionService.getDiscussionById(discussionId);
    return ApiResponse.success(res, discussion);
  });

  // Update discussion
  updateDiscussion = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const discussion = await discussionService.updateDiscussion(
      discussionId,
      req.body,
      req.user._id
    );
    return ApiResponse.success(res, discussion, 'Discussion updated successfully');
  });

  // Delete discussion
  deleteDiscussion = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const result = await discussionService.deleteDiscussion(
      discussionId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, result);
  });

  // Add reply
  addReply = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const reply = await discussionService.addReply(
      discussionId,
      req.body,
      req.user._id
    );
    return ApiResponse.created(res, reply, 'Reply added successfully');
  });

  // Update reply
  updateReply = asyncHandler(async (req, res) => {
    const { discussionId, replyId } = req.params;
    const { content } = req.body;
    const reply = await discussionService.updateReply(
      discussionId,
      replyId,
      content,
      req.user._id
    );
    return ApiResponse.success(res, reply, 'Reply updated successfully');
  });

  // Delete reply
  deleteReply = asyncHandler(async (req, res) => {
    const { discussionId, replyId } = req.params;
    const result = await discussionService.deleteReply(
      discussionId,
      replyId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, result);
  });

  // Toggle like
  toggleLike = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const result = await discussionService.toggleLike(discussionId, req.user._id);
    return ApiResponse.success(res, result);
  });

  // Toggle reply like
  toggleReplyLike = asyncHandler(async (req, res) => {
    const { discussionId, replyId } = req.params;
    const result = await discussionService.toggleReplyLike(
      discussionId,
      replyId,
      req.user._id
    );
    return ApiResponse.success(res, result);
  });

  // Toggle pin
  togglePin = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const discussion = await discussionService.togglePin(
      discussionId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, discussion, 'Discussion pin status updated');
  });

  // Toggle lock
  toggleLock = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    const discussion = await discussionService.toggleLock(
      discussionId,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, discussion, 'Discussion lock status updated');
  });
}

export default new DiscussionController();
