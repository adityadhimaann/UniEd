import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import Grade from '../models/Grade.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

class InstructorService {
  // Get all courses taught by instructor
  async getInstructorCourses(instructorId) {
    const courses = await Course.find({ faculty: instructorId })
      .populate('faculty', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return courses;
  }

  // Create a new course
  async createCourse(instructorId, courseData) {
    const { 
      code, 
      name, 
      description, 
      credits, 
      semester, 
      department, 
      schedule, 
      maxStudents, 
      titleImage,
      videos,
      materials,
      learningOutcomes,
      prerequisites
    } = courseData;

    console.log('Service received:', { code, name, description, credits, semester, department, schedule, maxStudents, titleImage });

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: code });
    if (existingCourse) {
      throw ApiError.conflict('Course code already exists');
    }

    const newCourse = {
      courseCode: code,
      courseName: name,
      description: description || '',
      credits: credits || 3,
      semester: semester || 1,
      department: department || 'General',
      faculty: instructorId,
      schedule: schedule || {},
      maxStudents: maxStudents || 60,
      titleImage: titleImage || null,
      videos: videos || [],
      materials: materials || [],
      learningOutcomes: learningOutcomes || [],
      prerequisites: prerequisites || [],
    };

    console.log('Creating course with:', newCourse);

    const course = await Course.create(newCourse);

    return await course.populate('faculty', 'firstName lastName email');
  }

  // Update course
  async updateCourse(courseId, instructorId, updates) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to update this course');
    }

    console.log('=== UPDATE COURSE SERVICE ===');
    console.log('Updates received:', updates);
    console.log('Current titleImage:', course.titleImage);
    console.log('New titleImage:', updates.titleImage);
    
    // Map frontend fields to model fields
    if (updates.name) course.courseName = updates.name;
    if (updates.description) course.description = updates.description;
    if (updates.credits) course.credits = updates.credits;
    if (updates.semester) course.semester = updates.semester;
    if (updates.department) course.department = updates.department;
    if (updates.schedule) course.schedule = updates.schedule;
    if (updates.maxStudents) course.maxStudents = updates.maxStudents;
    if (updates.isActive !== undefined) course.isActive = updates.isActive;
    if (updates.titleImage !== undefined) {
      console.log('Setting titleImage to:', updates.titleImage);
      course.titleImage = updates.titleImage;
    }

    await course.save();
    console.log('Course saved with titleImage:', course.titleImage);
    return await course.populate('faculty', 'firstName lastName email');
  }

  // Delete course
  async deleteCourse(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this course');
    }

    await course.deleteOne();
    return true;
  }

  // Get students enrolled in a course
  async getCourseStudents(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view students in this course');
    }

    const enrollments = await Enrollment.find({ course: courseId, status: 'active' })
      .populate('student', 'firstName lastName email')
      .sort({ enrolledAt: -1 });

    return enrollments.map(enrollment => enrollment.student);
  }

  // Create assignment
  async createAssignment(instructorId, assignmentData) {
    const { course, title, description, dueDate, totalPoints, attachments } = assignmentData;

    console.log('=== CREATE ASSIGNMENT SERVICE DEBUG ===');
    console.log('Full assignmentData:', JSON.stringify(assignmentData, null, 2));
    console.log('Extracted fields:', { course, title, description, dueDate, totalPoints, attachments });

    // Verify instructor teaches this course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw ApiError.notFound('Course not found');
    }

    if (courseDoc.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to create assignments for this course');
    }

    // Prepare assignment data
    const assignmentToCreate = {
      course,
      title,
      dueDate,
      totalMarks: totalPoints, // Map totalPoints to totalMarks
      createdBy: instructorId,
    };

    // Only add optional fields if they exist
    if (description) {
      assignmentToCreate.description = description;
    }
    if (attachments && attachments.length > 0) {
      assignmentToCreate.attachments = attachments;
    }

    console.log('Creating assignment with:', JSON.stringify(assignmentToCreate, null, 2));

    try {
      const assignment = await Assignment.create(assignmentToCreate);
      console.log('Assignment created successfully:', assignment._id);

      // Get all enrolled students in this course
      const enrollments = await Enrollment.find({ course, status: 'active' });
      
      // Create notifications for all enrolled students
      const notifications = enrollments.map(enrollment => ({
        user: enrollment.student,
        type: 'assignment',
        title: 'New Assignment Posted',
        content: `New assignment "${title}" has been posted for ${courseDoc.courseName}. Due: ${new Date(dueDate).toLocaleDateString()}`,
        link: `/dashboard/assignments`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return await assignment.populate('course', 'courseCode courseName');
    } catch (createError) {
      console.error('Error creating assignment:', createError);
      console.error('Validation errors:', createError.errors);
      throw createError;
    }
  }

  // Get course assignments
  async getCourseAssignments(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view assignments for this course');
    }

    const assignments = await Assignment.find({ course: courseId })
      .populate('course', 'courseCode courseName')
      .populate('submissions.student', 'firstName lastName email studentId')
      .sort({ dueDate: -1 });

    // Add submission statistics to each assignment
    const assignmentsWithStats = assignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      const totalSubmissions = assignmentObj.submissions?.length || 0;
      const gradedSubmissions = assignmentObj.submissions?.filter(s => s.grade !== null && s.grade !== undefined).length || 0;
      const pendingGrading = totalSubmissions - gradedSubmissions;

      return {
        ...assignmentObj,
        submissionStats: {
          total: totalSubmissions,
          graded: gradedSubmissions,
          pending: pendingGrading,
        }
      };
    });

    return assignmentsWithStats;
  }

  // Get assignment submissions for grading
  async getAssignmentSubmissions(assignmentId, instructorId) {
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'courseCode courseName faculty')
      .populate('submissions.student', 'firstName lastName email studentId');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view submissions for this assignment');
    }

    return {
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        totalMarks: assignment.totalMarks,
        dueDate: assignment.dueDate,
        course: assignment.course,
      },
      submissions: assignment.submissions || [],
    };
  }

  // Grade a submission
  async gradeSubmission(assignmentId, studentId, instructorId, gradeData) {
    console.log('=== GRADE SUBMISSION SERVICE ===');
    console.log('Assignment ID:', assignmentId);
    console.log('Student ID:', studentId);
    console.log('Instructor ID:', instructorId);
    console.log('Grade Data:', gradeData);

    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'faculty courseName');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to grade this assignment');
    }

    // Find the submission - handle both populated and non-populated student field
    const submission = assignment.submissions.find(sub => {
      const subStudentId = sub.student._id ? sub.student._id.toString() : sub.student.toString();
      return subStudentId === studentId.toString();
    });

    console.log('Found submission:', submission ? 'Yes' : 'No');
    if (submission) {
      console.log('Current submission status:', submission.status);
      console.log('Current submission grade:', submission.grade);
    }

    if (!submission) {
      throw ApiError.notFound('Submission not found');
    }

    // Validate grade
    const gradeValue = Number(gradeData.grade);
    console.log('Grade value (converted):', gradeValue);
    console.log('Total marks:', assignment.totalMarks);

    if (isNaN(gradeValue)) {
      throw ApiError.badRequest('Grade must be a valid number');
    }

    if (gradeValue < 0 || gradeValue > assignment.totalMarks) {
      throw ApiError.badRequest(`Grade must be between 0 and ${assignment.totalMarks}`);
    }

    // Update grade and feedback
    submission.grade = gradeValue;
    submission.feedback = gradeData.feedback || '';
    submission.status = 'graded';
    // Don't set reviewedBy or reviewedAt when grading - only when reviewing
    // These fields are for the review workflow (approve/disapprove/viewed)

    console.log('Updated submission:', {
      grade: submission.grade,
      feedback: submission.feedback,
      status: submission.status
    });

    // Mark the submissions array as modified to ensure Mongoose saves it
    assignment.markModified('submissions');

    try {
      // Use validateBeforeSave: false to skip validation on unchanged fields
      await assignment.save({ validateBeforeSave: false });
      console.log('✅ Assignment saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving assignment:', saveError);
      console.error('Validation errors:', saveError.errors);
      throw ApiError.badRequest(`Failed to save grade: ${saveError.message}`);
    }

    // Send notification to student
    try {
      const notification = await Notification.create({
        user: studentId,
        type: 'grade',
        title: 'Assignment Graded',
        content: `Your assignment "${assignment.title}" has been graded. Score: ${gradeData.grade}/${assignment.totalMarks}`,
        link: `/dashboard/assignments`,
      });

      // Send real-time notification via Socket.IO
      const { sendNotification } = await import('../socket/socketHandler.js');
      sendNotification(studentId.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return {
      assignment: assignment,
      submission: submission,
      message: 'Submission graded successfully'
    };
  }

  // Review submission (approve/disapprove/viewed)
  async reviewSubmission(assignmentId, studentId, instructorId, reviewData) {
    const { reviewStatus, feedback } = reviewData;

    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'faculty courseName')
      .populate('submissions.student', 'firstName lastName email');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to review this assignment');
    }

    // Find the submission - handle both populated and non-populated student field
    const submission = assignment.submissions.find(sub => {
      const subStudentId = sub.student._id ? sub.student._id.toString() : sub.student.toString();
      return subStudentId === studentId.toString();
    });

    if (!submission) {
      throw ApiError.notFound('Submission not found');
    }

    // Update review status
    submission.reviewStatus = reviewStatus;
    submission.reviewedAt = new Date();
    submission.reviewedBy = instructorId;
    
    if (feedback) {
      submission.feedback = feedback;
    }

    await assignment.save();

    // Send notification to student
    const notificationMessages = {
      viewed: `Your submission for "${assignment.title}" has been viewed by the instructor.`,
      approved: `Your submission for "${assignment.title}" has been approved! Great work!`,
      disapproved: `Your submission for "${assignment.title}" needs revision. Please check the feedback.`,
    };

    try {
      const notification = await Notification.create({
        user: studentId,
        type: 'submission-reviewed',
        title: `Submission ${reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1)}`,
        content: notificationMessages[reviewStatus] + (feedback ? ` Feedback: ${feedback}` : ''),
        link: `/dashboard/assignments`,
      });

      // Send real-time notification via Socket.IO
      const { sendNotification } = await import('../socket/socketHandler.js');
      sendNotification(studentId.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return {
      assignment: assignment,
      submission: submission,
      message: `Submission ${reviewStatus} successfully`
    };
  }

  // Update assignment
  async updateAssignment(assignmentId, instructorId, updates) {
    const assignment = await Assignment.findById(assignmentId).populate('course');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to update this assignment');
    }

    const allowedUpdates = ['title', 'description', 'dueDate', 'totalPoints', 'attachments'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        assignment[field] = updates[field];
      }
    });

    await assignment.save();
    return await assignment.populate('course', 'courseCode courseName');
  }

  // Delete assignment
  async deleteAssignment(assignmentId, instructorId) {
    const assignment = await Assignment.findById(assignmentId).populate('course');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this assignment');
    }

    await assignment.deleteOne();
    return true;
  }

  // Mark attendance
  async markAttendance(instructorId, courseId, date, attendanceRecords) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to mark attendance for this course');
    }

    // Create or update attendance
    const attendancePromises = attendanceRecords.map(async record => {
      const { student, status } = record;

      const attendance = await Attendance.findOneAndUpdate(
        { course: courseId, student, date },
        { status },
        { upsert: true, new: true }
      );

      return attendance;
    });

    const results = await Promise.all(attendancePromises);
    return results;
  }

  // Get course attendance
  async getCourseAttendance(courseId, instructorId, startDate, endDate) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view attendance for this course');
    }

    const query = { course: courseId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName')
      .sort({ date: -1 });

    return attendance;
  }

  // Create announcement
  async createAnnouncement(instructorId, announcementData) {
    const { course, title, content, priority } = announcementData;

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw ApiError.notFound('Course not found');
    }

    if (courseDoc.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to create announcements for this course');
    }

    const announcement = await Announcement.create({
      course,
      title,
      content,
      priority,
      createdBy: instructorId,
    });

    return await announcement.populate([
      { path: 'course', select: 'courseCode courseName' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
  }

  // Get course announcements
  async getCourseAnnouncements(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view announcements for this course');
    }

    const announcements = await Announcement.find({ course: courseId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return announcements;
  }

  // Update announcement
  async updateAnnouncement(announcementId, instructorId, updates) {
    const announcement = await Announcement.findById(announcementId).populate('course');

    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }

    if (announcement.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to update this announcement');
    }

    const allowedUpdates = ['title', 'content', 'priority'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        announcement[field] = updates[field];
      }
    });

    await announcement.save();
    return await announcement.populate([
      { path: 'course', select: 'courseCode courseName' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
  }

  // Delete announcement
  async deleteAnnouncement(announcementId, instructorId) {
    const announcement = await Announcement.findById(announcementId).populate('course');

    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }

    if (announcement.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this announcement');
    }

    await announcement.deleteOne();
    return true;
  }

  // Get instructor statistics
  async getInstructorStatistics(instructorId) {
    const courses = await Course.find({ faculty: instructorId });
    const courseIds = courses.map(c => c._id);

    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: 'active'
    });

    const totalAssignments = await Assignment.countDocuments({
      course: { $in: courseIds }
    });

    const totalAnnouncements = await Announcement.countDocuments({
      course: { $in: courseIds }
    });

    return {
      totalCourses: courses.length,
      totalStudents,
      totalAssignments,
      totalAnnouncements,
      activeCourses: courses.filter(c => c.isActive).length,
    };
  }

  // Submit grades
  async submitGrades(courseId, instructorId, grades) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to submit grades for this course');
    }

    const gradePromises = grades.map(async gradeData => {
      const { student, grade, semester, type } = gradeData;

      const gradeDoc = await Grade.findOneAndUpdate(
        { course: courseId, student, semester, type },
        { grade },
        { upsert: true, new: true }
      );

      return gradeDoc;
    });

    const results = await Promise.all(gradePromises);
    return results;
  }

  // Get course grades
  async getCourseGrades(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to view grades for this course');
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName')
      .sort({ createdAt: -1 });

    return grades;
  }

  // Get instructor notifications
  async getNotifications(instructorId, options = {}) {
    const { limit = 20, skip = 0 } = options;

    const notifications = await Notification.find({ user: instructorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const unreadCount = await Notification.countDocuments({ 
      user: instructorId, 
      isRead: false 
    });

    return {
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ user: instructorId })
    };
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, instructorId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: instructorId
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(instructorId) {
    const result = await Notification.updateMany(
      { user: instructorId, isRead: false },
      { $set: { isRead: true } }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} notifications marked as read`
    };
  }

  // ==================== COURSE CONTENT MANAGEMENT ====================

  // Create course with full content (videos, materials, outcomes, prerequisites)
  async createCourseWithContent(instructorId, courseData) {
    const { 
      code, 
      name, 
      description, 
      credits, 
      semester, 
      department, 
      schedule, 
      maxStudents, 
      titleImage,
      videos,
      materials,
      learningOutcomes,
      prerequisites
    } = courseData;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: code });
    if (existingCourse) {
      throw ApiError.conflict('Course code already exists');
    }

    const newCourse = {
      courseCode: code,
      courseName: name,
      description: description || '',
      credits: credits || 3,
      semester: semester || 1,
      department: department || 'General',
      faculty: instructorId,
      schedule: schedule || {},
      maxStudents: maxStudents || 60,
      titleImage: titleImage || null,
      videos: videos || [],
      materials: materials || [],
      learningOutcomes: learningOutcomes || [],
      prerequisites: prerequisites || [],
    };

    const course = await Course.create(newCourse);
    await course.populate('faculty', 'firstName lastName email');

    return {
      course,
      stats: {
        videosAdded: course.videos?.length || 0,
        materialsAdded: course.materials?.length || 0,
        learningOutcomesAdded: course.learningOutcomes?.length || 0,
        prerequisitesAdded: course.prerequisites?.length || 0,
      }
    };
  }

  // Add video to course
  async addCourseVideo(courseId, instructorId, videoData) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    const video = {
      title: videoData.title,
      url: videoData.url,
      description: videoData.description || '',
      duration: videoData.duration || '',
      order: videoData.order || (course.videos?.length || 0) + 1,
      isPublic: videoData.isPublic || false,
    };

    if (!course.videos) {
      course.videos = [];
    }

    course.videos.push(video);
    await course.save();

    return course;
  }

  // Update video in course
  async updateCourseVideo(courseId, instructorId, videoId, videoData) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    const videoIndex = course.videos.findIndex(v => v._id.toString() === videoId);
    
    if (videoIndex === -1) {
      throw ApiError.notFound('Video not found');
    }

    course.videos[videoIndex] = {
      ...course.videos[videoIndex].toObject(),
      ...videoData,
      _id: course.videos[videoIndex]._id,
    };

    await course.save();
    return course;
  }

  // Delete video from course
  async deleteCourseVideo(courseId, instructorId, videoId) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    course.videos = course.videos.filter(v => v._id.toString() !== videoId);
    await course.save();

    return course;
  }

  // Add material to course
  async addCourseMaterial(courseId, instructorId, materialData) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    const material = {
      title: materialData.title,
      type: materialData.type,
      url: materialData.url,
      description: materialData.description || '',
      size: materialData.size || '',
      uploadedAt: new Date(),
    };

    if (!course.materials) {
      course.materials = [];
    }

    course.materials.push(material);
    await course.save();

    return course;
  }

  // Update material in course
  async updateCourseMaterial(courseId, instructorId, materialId, materialData) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    const materialIndex = course.materials.findIndex(m => m._id.toString() === materialId);
    
    if (materialIndex === -1) {
      throw ApiError.notFound('Material not found');
    }

    course.materials[materialIndex] = {
      ...course.materials[materialIndex].toObject(),
      ...materialData,
      _id: course.materials[materialIndex]._id,
    };

    await course.save();
    return course;
  }

  // Delete material from course
  async deleteCourseMaterial(courseId, instructorId, materialId) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    course.materials = course.materials.filter(m => m._id.toString() !== materialId);
    await course.save();

    return course;
  }

  // Update learning outcomes
  async updateLearningOutcomes(courseId, instructorId, outcomes) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    course.learningOutcomes = outcomes;
    await course.save();

    return course;
  }

  // Update prerequisites
  async updatePrerequisites(courseId, instructorId, prerequisites) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId });
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    course.prerequisites = prerequisites;
    await course.save();

    return course;
  }

  // Get course content (videos, materials, outcomes, prerequisites)
  async getCourseContent(courseId, instructorId) {
    const course = await Course.findOne({ _id: courseId, faculty: instructorId })
      .select('videos materials learningOutcomes prerequisites courseName courseCode');
    
    if (!course) {
      throw ApiError.notFound('Course not found or you do not have permission');
    }

    return {
      courseId: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      videos: course.videos || [],
      materials: course.materials || [],
      learningOutcomes: course.learningOutcomes || [],
      prerequisites: course.prerequisites || [],
    };
  }
}

export default new InstructorService();
