import VirtualClass from '../models/VirtualClass.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import notificationService from './notificationService.js';
import { broadcastToVirtualClass, sendNotification } from '../socket/socketHandler.js';

class VirtualClassService {
  // Create a new virtual class
  async createVirtualClass(hostId, classData) {
    const { title, description, course, scheduledStartTime, scheduledEndTime, password, settings } = classData;

    // Verify course exists and host is the instructor
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw ApiError.notFound('Course not found');
    }

    if (courseDoc.faculty.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the course instructor can create virtual classes');
    }

    // Generate unique meeting link
    const meetingLink = `${course}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const virtualClass = await VirtualClass.create({
      title,
      description,
      course,
      host: hostId,
      scheduledStartTime,
      scheduledEndTime,
      meetingLink,
      password,
      settings: settings || {},
    });

    // Notify all enrolled students
    const enrollments = await Enrollment.find({ course }).populate('student');
    const notificationPromises = enrollments.map(enrollment =>
      notificationService.createNotification(
        enrollment.student._id,
        'virtual_class',
        'New Virtual Class Scheduled',
        `${title} has been scheduled for ${new Date(scheduledStartTime).toLocaleString()}`,
        `/dashboard/virtual-classes`
      )
    );

    await Promise.all(notificationPromises);

    return await virtualClass.populate([
      { path: 'course', select: 'courseCode courseName' },
      { path: 'host', select: 'firstName lastName email' },
    ]);
  }

  // Get virtual classes for a course
  async getCourseVirtualClasses(courseId, userId, userRole) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Check if user has access
    if (userRole === 'student') {
      const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
      if (!enrollment) {
        throw ApiError.forbidden('You are not enrolled in this course');
      }
    } else if (userRole === 'faculty') {
      if (course.faculty.toString() !== userId.toString()) {
        throw ApiError.forbidden('You are not the instructor of this course');
      }
    }

    const virtualClasses = await VirtualClass.find({ course: courseId })
      .populate('host', 'firstName lastName email')
      .populate('course', 'courseCode courseName')
      .sort({ scheduledStartTime: -1 });

    return virtualClasses;
  }

  // Get virtual class by ID
  async getVirtualClassById(classId, userId) {
    const virtualClass = await VirtualClass.findById(classId)
      .populate('host', 'firstName lastName email avatar')
      .populate('course', 'courseCode courseName')
      .populate('participants.user', 'firstName lastName email avatar')
      .populate('chatMessages.sender', 'firstName lastName email avatar')
      .populate('polls.createdBy', 'firstName lastName');

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    // Check if user has access
    const course = await Course.findById(virtualClass.course._id);
    const isHost = virtualClass.host._id.toString() === userId.toString();
    const isEnrolled = await Enrollment.findOne({ course: virtualClass.course._id, student: userId });

    if (!isHost && !isEnrolled) {
      throw ApiError.forbidden('You do not have access to this virtual class');
    }

    return virtualClass;
  }

  // Start a virtual class
  async startVirtualClass(classId, hostId) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can start the class');
    }

    if (virtualClass.status === 'live') {
      throw ApiError.badRequest('Class is already live');
    }

    virtualClass.status = 'live';
    virtualClass.actualStartTime = new Date();

    await virtualClass.save();

    // Notify all enrolled students
    const enrollments = await Enrollment.find({ course: virtualClass.course }).populate('student');
    const notificationPromises = enrollments.map(enrollment =>
      notificationService.createNotification(
        enrollment.student._id,
        'virtual_class',
        'Virtual Class Started',
        `${virtualClass.title} is now live! Click to join.`,
        `/dashboard/virtual-classes`
      )
    );

    await Promise.all(notificationPromises);

    // Emit Socket.IO event
    try {
      broadcastToVirtualClass(classId, 'virtualClass:started', {
        classId,
        title: virtualClass.title,
        startTime: virtualClass.actualStartTime,
      });
    } catch (error) {
      console.error('Socket.IO broadcast error:', error);
    }

    return virtualClass;
  }

  // End a virtual class
  async endVirtualClass(classId, hostId) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can end the class');
    }

    virtualClass.status = 'ended';
    virtualClass.actualEndTime = new Date();

    // Mark all participants as left
    virtualClass.participants.forEach(participant => {
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }
    });

    await virtualClass.save();

    // Emit Socket.IO event
    try {
      broadcastToVirtualClass(classId, 'virtualClass:ended', {
        classId,
        endTime: virtualClass.actualEndTime,
      });
    } catch (error) {
      console.error('Socket.IO broadcast error:', error);
    }

    return virtualClass;
  }

  // Join a virtual class
  async joinVirtualClass(classId, userId, role = 'participant') {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.status !== 'live') {
      throw ApiError.badRequest('Class is not live yet');
    }

    // Check if already joined
    const existingParticipant = virtualClass.participants.find(
      p => p.user.toString() === userId.toString() && !p.leftAt
    );

    if (existingParticipant) {
      return virtualClass;
    }

    // Check max participants
    const activeParticipants = virtualClass.participants.filter(p => !p.leftAt);
    if (activeParticipants.length >= virtualClass.settings.maxParticipants) {
      throw ApiError.badRequest('Class has reached maximum participants');
    }

    virtualClass.participants.push({
      user: userId,
      role: virtualClass.host.toString() === userId.toString() ? 'host' : role,
      joinedAt: new Date(),
    });

    await virtualClass.save();

    return await virtualClass.populate('participants.user', 'firstName lastName email avatar');
  }

  // Leave a virtual class
  async leaveVirtualClass(classId, userId) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    const participant = virtualClass.participants.find(
      p => p.user.toString() === userId.toString() && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      await virtualClass.save();
    }

    return virtualClass;
  }

  // Send chat message
  async sendChatMessage(classId, userId, message, isPrivate = false, recipientId = null) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (!virtualClass.settings.allowParticipantChat) {
      const isHost = virtualClass.host.toString() === userId.toString();
      if (!isHost) {
        throw ApiError.forbidden('Chat is disabled for participants');
      }
    }

    virtualClass.chatMessages.push({
      sender: userId,
      message,
      isPrivate,
      recipient: recipientId,
      timestamp: new Date(),
    });

    await virtualClass.save();

    return await virtualClass.populate('chatMessages.sender', 'firstName lastName email avatar');
  }

  // Create poll
  async createPoll(classId, hostId, pollData) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can create polls');
    }

    const poll = {
      question: pollData.question,
      options: pollData.options.map(opt => ({ text: opt, votes: [] })),
      createdBy: hostId,
      createdAt: new Date(),
      isActive: true,
    };

    virtualClass.polls.push(poll);
    await virtualClass.save();

    // Emit Socket.IO event
    try {
      const populatedClass = await virtualClass.populate('polls.createdBy', 'firstName lastName');
      const newPoll = populatedClass.polls[populatedClass.polls.length - 1];
      
      broadcastToVirtualClass(classId, 'virtualClass:poll:new', {
        poll: newPoll,
      });
    } catch (error) {
      console.error('Socket.IO broadcast error:', error);
    }

    return virtualClass;
  }

  // Vote on poll
  async voteOnPoll(classId, userId, pollId, optionIndex) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    const poll = virtualClass.polls.id(pollId);
    if (!poll) {
      throw ApiError.notFound('Poll not found');
    }

    if (!poll.isActive) {
      throw ApiError.badRequest('Poll is no longer active');
    }

    // Remove previous vote if exists
    poll.options.forEach(option => {
      option.votes = option.votes.filter(vote => vote.toString() !== userId.toString());
    });

    // Add new vote
    if (poll.options[optionIndex]) {
      poll.options[optionIndex].votes.push(userId);
    }

    await virtualClass.save();

    // Emit Socket.IO event
    try {
      broadcastToVirtualClass(classId, 'virtualClass:poll:voted', {
        pollId,
        optionIndex,
        poll,
      });
    } catch (error) {
      console.error('Socket.IO broadcast error:', error);
    }

    return virtualClass;
  }

  // Update whiteboard
  async updateWhiteboard(classId, userId, whiteboardData) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    virtualClass.whiteboard = {
      data: whiteboardData,
      lastUpdated: new Date(),
    };

    await virtualClass.save();

    return virtualClass;
  }

  // Share file
  async shareFile(classId, userId, fileData) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    virtualClass.sharedFiles.push({
      name: fileData.name,
      url: fileData.url,
      uploadedBy: userId,
      uploadedAt: new Date(),
    });

    await virtualClass.save();

    return virtualClass;
  }

  // Toggle participant settings
  async toggleParticipantSetting(classId, hostId, participantId, setting, value) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can modify participant settings');
    }

    const participant = virtualClass.participants.find(
      p => p.user.toString() === participantId.toString() && !p.leftAt
    );

    if (!participant) {
      throw ApiError.notFound('Participant not found');
    }

    if (setting === 'mute') {
      participant.isMuted = value;
    } else if (setting === 'video') {
      participant.isVideoOff = value;
    } else if (setting === 'handRaised') {
      participant.isHandRaised = value;
    }

    await virtualClass.save();

    return virtualClass;
  }

  // Update class settings
  async updateClassSettings(classId, hostId, settings) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can update class settings');
    }

    virtualClass.settings = { ...virtualClass.settings, ...settings };
    await virtualClass.save();

    return virtualClass;
  }

  // Delete virtual class
  async deleteVirtualClass(classId, hostId) {
    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      throw ApiError.notFound('Virtual class not found');
    }

    if (virtualClass.host.toString() !== hostId.toString()) {
      throw ApiError.forbidden('Only the host can delete the class');
    }

    if (virtualClass.status === 'live') {
      throw ApiError.badRequest('Cannot delete a live class');
    }

    await VirtualClass.findByIdAndDelete(classId);

    return { message: 'Virtual class deleted successfully' };
  }
}

export default new VirtualClassService();
