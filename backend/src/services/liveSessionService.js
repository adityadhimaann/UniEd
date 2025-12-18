import LiveSession from '../models/LiveSession.js';
import ApiError from '../utils/ApiError.js';
import { sendNotification, broadcastToClass } from '../socket/socketHandler.js';
import Notification from '../models/Notification.js';
import Enrollment from '../models/Enrollment.js';

class LiveSessionService {
  // Create a new live session
  async createLiveSession(sessionData, instructorId) {
    const session = await LiveSession.create({
      ...sessionData,
      instructor: instructorId,
    });

    await session.populate('instructor', 'firstName lastName email');

    // Notify enrolled students
    const enrollments = await Enrollment.find({ 
      course: session.course, 
      status: 'active' 
    });

    for (const enrollment of enrollments) {
      const notification = await Notification.create({
        user: enrollment.student,
        type: 'live-session',
        title: 'New Live Session Scheduled',
        message: `"${session.title}" scheduled for ${session.scheduledStart.toLocaleString()}`,
        metadata: {
          sessionId: session._id,
          courseId: session.course,
          scheduledStart: session.scheduledStart,
        },
      });

      sendNotification(enrollment.student.toString(), notification);
    }

    return session;
  }

  // Get all sessions for a course
  async getCourseSessions(courseId, filters = {}) {
    const query = { course: courseId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.from && filters.to) {
      query.scheduledStart = {
        $gte: new Date(filters.from),
        $lte: new Date(filters.to),
      };
    }

    const sessions = await LiveSession.find(query)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('participants.user', 'firstName lastName email avatar')
      .sort({ scheduledStart: -1 });

    return sessions;
  }

  // Get session by ID
  async getSessionById(sessionId) {
    const session = await LiveSession.findById(sessionId)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('participants.user', 'firstName lastName email avatar role')
      .populate('materials');

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    return session;
  }

  // Update session
  async updateSession(sessionId, updates, instructorId) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.instructor.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only update your own sessions');
    }

    // Don't allow updates if session is live or completed
    if (session.status === 'live' || session.status === 'completed') {
      throw ApiError.badRequest('Cannot update a live or completed session');
    }

    Object.assign(session, updates);
    await session.save();

    // Notify participants if schedule changed
    if (updates.scheduledStart || updates.scheduledEnd) {
      const enrollments = await Enrollment.find({ 
        course: session.course, 
        status: 'active' 
      });

      for (const enrollment of enrollments) {
        const notification = await Notification.create({
          user: enrollment.student,
          type: 'live-session-update',
          title: 'Live Session Updated',
          message: `"${session.title}" has been rescheduled`,
          metadata: {
            sessionId: session._id,
            scheduledStart: session.scheduledStart,
          },
        });

        sendNotification(enrollment.student.toString(), notification);
      }
    }

    return session;
  }

  // Start session
  async startSession(sessionId, instructorId) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.instructor.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only start your own sessions');
    }

    if (session.status !== 'scheduled') {
      throw ApiError.badRequest('Session has already started or is completed');
    }

    session.status = 'live';
    session.actualStart = new Date();
    await session.save();

    // Notify enrolled students
    const enrollments = await Enrollment.find({ 
      course: session.course, 
      status: 'active' 
    });

    for (const enrollment of enrollments) {
      const notification = await Notification.create({
        user: enrollment.student,
        type: 'live-session-started',
        title: 'Live Session Started',
        message: `"${session.title}" is now live!`,
        metadata: {
          sessionId: session._id,
          meetingLink: session.meetingLink,
        },
      });

      sendNotification(enrollment.student.toString(), notification);
    }

    // Broadcast to class
    broadcastToClass(session.course.toString(), 'session:started', {
      sessionId: session._id,
      title: session.title,
      meetingLink: session.meetingLink,
    });

    return session;
  }

  // End session
  async endSession(sessionId, instructorId) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.instructor.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only end your own sessions');
    }

    if (session.status !== 'live') {
      throw ApiError.badRequest('Session is not currently live');
    }

    session.status = 'completed';
    session.actualEnd = new Date();

    // Calculate duration for each participant
    session.participants.forEach(participant => {
      if (participant.isPresent && !participant.leftAt) {
        participant.leftAt = new Date();
      }
      if (participant.joinedAt && participant.leftAt) {
        participant.duration = Math.round(
          (participant.leftAt - participant.joinedAt) / (1000 * 60)
        );
      }
    });

    await session.save();

    // Broadcast to class
    broadcastToClass(session.course.toString(), 'session:ended', {
      sessionId: session._id,
      title: session.title,
    });

    return session;
  }

  // Join session
  async joinSession(sessionId, userId) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.status !== 'live') {
      throw ApiError.badRequest('Session is not currently live');
    }

    // Check if already joined
    const existingParticipant = session.participants.find(
      p => p.user.toString() === userId.toString() && p.isPresent
    );

    if (existingParticipant) {
      return session;
    }

    // Check max participants
    const activeParticipants = session.participants.filter(p => p.isPresent).length;
    if (activeParticipants >= session.maxParticipants) {
      throw ApiError.badRequest('Session has reached maximum participants');
    }

    // Add participant
    session.participants.push({
      user: userId,
      joinedAt: new Date(),
      isPresent: true,
    });

    await session.save();

    // Broadcast to class
    broadcastToClass(session.course.toString(), 'session:participant-joined', {
      sessionId: session._id,
      userId,
    });

    return session;
  }

  // Leave session
  async leaveSession(sessionId, userId) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    const participant = session.participants.find(
      p => p.user.toString() === userId.toString() && p.isPresent
    );

    if (!participant) {
      throw ApiError.notFound('You are not in this session');
    }

    participant.isPresent = false;
    participant.leftAt = new Date();
    participant.duration = Math.round(
      (participant.leftAt - participant.joinedAt) / (1000 * 60)
    );

    await session.save();

    // Broadcast to class
    broadcastToClass(session.course.toString(), 'session:participant-left', {
      sessionId: session._id,
      userId,
    });

    return session;
  }

  // Cancel session
  async cancelSession(sessionId, instructorId, reason) {
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.instructor.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only cancel your own sessions');
    }

    if (session.status === 'completed') {
      throw ApiError.badRequest('Cannot cancel a completed session');
    }

    session.status = 'cancelled';
    session.notes = reason || 'Session cancelled by instructor';
    await session.save();

    // Notify enrolled students
    const enrollments = await Enrollment.find({ 
      course: session.course, 
      status: 'active' 
    });

    for (const enrollment of enrollments) {
      const notification = await Notification.create({
        user: enrollment.student,
        type: 'live-session-cancelled',
        title: 'Live Session Cancelled',
        message: `"${session.title}" has been cancelled`,
        metadata: {
          sessionId: session._id,
          reason: session.notes,
        },
      });

      sendNotification(enrollment.student.toString(), notification);
    }

    return session;
  }

  // Get session statistics
  async getSessionStatistics(sessionId, instructorId) {
    const session = await LiveSession.findById(sessionId)
      .populate('participants.user', 'firstName lastName email');

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.instructor.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You can only view statistics for your own sessions');
    }

    const statistics = {
      totalParticipants: session.participants.length,
      averageDuration: session.participants.length > 0
        ? Math.round(session.participants.reduce((sum, p) => sum + p.duration, 0) / session.participants.length)
        : 0,
      sessionDuration: session.duration,
      participants: session.participants.map(p => ({
        user: p.user,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        duration: p.duration,
      })),
    };

    return statistics;
  }
}

export default new LiveSessionService();
