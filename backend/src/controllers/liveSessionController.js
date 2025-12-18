import liveSessionService from '../services/liveSessionService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class LiveSessionController {
  // Create live session
  createLiveSession = asyncHandler(async (req, res) => {
    const session = await liveSessionService.createLiveSession(
      req.body,
      req.user._id
    );
    return ApiResponse.created(res, session, 'Live session created successfully');
  });

  // Get course sessions
  getCourseSessions = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { status, from, to } = req.query;
    const sessions = await liveSessionService.getCourseSessions(courseId, {
      status,
      from,
      to,
    });
    return ApiResponse.success(res, sessions);
  });

  // Get session by ID
  getSessionById = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.getSessionById(sessionId);
    return ApiResponse.success(res, session);
  });

  // Update session
  updateSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.updateSession(
      sessionId,
      req.body,
      req.user._id
    );
    return ApiResponse.success(res, session, 'Session updated successfully');
  });

  // Start session
  startSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.startSession(sessionId, req.user._id);
    return ApiResponse.success(res, session, 'Session started successfully');
  });

  // End session
  endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.endSession(sessionId, req.user._id);
    return ApiResponse.success(res, session, 'Session ended successfully');
  });

  // Join session
  joinSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.joinSession(sessionId, req.user._id);
    return ApiResponse.success(res, session, 'Joined session successfully');
  });

  // Leave session
  leaveSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await liveSessionService.leaveSession(sessionId, req.user._id);
    return ApiResponse.success(res, session, 'Left session successfully');
  });

  // Cancel session
  cancelSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { reason } = req.body;
    const session = await liveSessionService.cancelSession(
      sessionId,
      req.user._id,
      reason
    );
    return ApiResponse.success(res, session, 'Session cancelled successfully');
  });

  // Get session statistics
  getSessionStatistics = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const statistics = await liveSessionService.getSessionStatistics(
      sessionId,
      req.user._id
    );
    return ApiResponse.success(res, statistics);
  });
}

export default new LiveSessionController();
