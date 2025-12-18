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
    const { code, name, description, credits, semester, department, schedule, maxStudents, titleImage } = courseData;

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

    console.log('Creating assignment with data:', { course, title, description, dueDate, totalPoints, attachments });

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

    console.log('Creating assignment with:', assignmentToCreate);

    const assignment = await Assignment.create(assignmentToCreate);

    // Get all enrolled students in this course
    const enrollments = await Enrollment.find({ course, status: 'active' });
    
    // Create notifications for all enrolled students
    const notifications = enrollments.map(enrollment => ({
      user: enrollment.student,
      type: 'assignment',
      title: 'New Assignment Posted',
      message: `New assignment "${title}" has been posted for ${courseDoc.courseName}. Due: ${new Date(dueDate).toLocaleDateString()}`,
      metadata: {
        assignmentId: assignment._id,
        courseId: course,
        courseName: courseDoc.courseName,
        dueDate: dueDate,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return await assignment.populate('course', 'courseCode courseName');
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
      .sort({ dueDate: -1 });

    return assignments;
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

  // Grade assignment submission
  async gradeSubmission(assignmentId, studentId, instructorId, grade, feedback) {
    const assignment = await Assignment.findById(assignmentId).populate('course');

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    if (assignment.course.faculty.toString() !== instructorId.toString()) {
      throw ApiError.forbidden('You are not authorized to grade this assignment');
    }

    // Find the submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      throw ApiError.notFound('Submission not found');
    }

    // Update submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await assignment.save();
    return submission;
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
}

export default new InstructorService();
