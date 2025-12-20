import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

// Get student dashboard data
const getDashboardData = async (studentId) => {
  // Get enrolled courses count
  const enrolledCourses = await Enrollment.find({ 
    student: studentId,
    status: 'active'
  }).countDocuments();

  // Get total assignments
  const enrollments = await Enrollment.find({ 
    student: studentId,
    status: 'active'
  }).select('course');
  
  const courseIds = enrollments.map(e => e.course);
  
  const totalAssignments = await Assignment.countDocuments({
    course: { $in: courseIds }
  });

  // Get pending assignments (not submitted)
  const submittedAssignments = await Grade.find({
    student: studentId
  }).distinct('assignment');

  const pendingAssignments = await Assignment.countDocuments({
    course: { $in: courseIds },
    _id: { $nin: submittedAssignments },
    dueDate: { $gte: new Date() }
  });

  // Get recent announcements
  const recentAnnouncements = await Announcement.find({
    course: { $in: courseIds }
  })
    .populate('course', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate average grade
  const grades = await Grade.find({
    student: studentId,
    points: { $exists: true }
  });

  let averageGrade = 0;
  if (grades.length > 0) {
    const totalPoints = grades.reduce((sum, grade) => sum + grade.points, 0);
    const maxPoints = grades.reduce((sum, grade) => sum + (grade.maxPoints || 100), 0);
    averageGrade = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  }

  // Get attendance percentage
  const attendanceRecords = await Attendance.find({
    student: studentId
  });

  let attendancePercentage = 0;
  if (attendanceRecords.length > 0) {
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    attendancePercentage = (presentCount / attendanceRecords.length) * 100;
  }

  return {
    enrolledCourses,
    totalAssignments,
    pendingAssignments,
    averageGrade: Math.round(averageGrade),
    attendancePercentage: Math.round(attendancePercentage),
    recentAnnouncements,
  };
};

// Get enrolled courses
const getEnrolledCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ 
    student: studentId,
    status: 'active'
  })
    .populate({
      path: 'course',
      populate: {
        path: 'faculty',
        select: 'firstName lastName email'
      }
    })
    .sort({ enrolledAt: -1 });

  return enrollments;
};

// Get all available courses created by faculty
const getAvailableCourses = async (studentId) => {
  // Get courses the student is already enrolled in
  const enrolledCourseIds = await Enrollment.find({
    student: studentId,
    status: 'active'
  }).distinct('course');

  // Get all active courses
  const courses = await Course.find({
    isActive: true
  })
    .populate('faculty', 'firstName lastName email')
    .sort({ createdAt: -1 });

  // Mark which courses the student is enrolled in
  return courses.map(course => ({
    ...course.toObject(),
    isEnrolled: enrolledCourseIds.some(id => id.toString() === course._id.toString())
  }));
};

// Get course suggestions (courses not enrolled in)
const getCourseSuggestions = async (studentId) => {
  // Get courses the student is already enrolled in
  const enrolledCourseIds = await Enrollment.find({
    student: studentId,
    status: 'active'
  }).distinct('course');

  // Get courses not enrolled in
  const suggestions = await Course.find({
    isActive: true,
    _id: { $nin: enrolledCourseIds }
  })
    .populate('faculty', 'firstName lastName email')
    .limit(10)
    .sort({ createdAt: -1 });

  // Add enrollment count
  const coursesWithCount = await Promise.all(
    suggestions.map(async (course) => {
      const enrollmentCount = await Enrollment.countDocuments({
        course: course._id,
        status: 'active'
      });
      return {
        ...course.toObject(),
        enrollmentCount
      };
    })
  );

  return coursesWithCount;
};

// Get course details
const getCourseDetails = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  const course = await Course.findById(courseId)
    .populate('faculty', 'firstName lastName email');

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Get course statistics
  const totalStudents = await Enrollment.countDocuments({
    course: courseId,
    status: 'active'
  });

  const totalAssignments = await Assignment.countDocuments({ course: courseId });
  const totalAnnouncements = await Announcement.countDocuments({ course: courseId });

  return {
    ...course.toObject(),
    stats: {
      totalStudents,
      totalAssignments,
      totalAnnouncements,
    }
  };
};

// Get student assignments
const getStudentAssignments = async (studentId) => {
  console.log('=== GET STUDENT ASSIGNMENTS ===');
  console.log('Student ID:', studentId);
  
  const enrollments = await Enrollment.find({ 
    student: studentId,
    status: 'active'
  }).select('course');
  
  const courseIds = enrollments.map(e => e.course);
  console.log('Course IDs:', courseIds);
  
  const assignments = await Assignment.find({
    course: { $in: courseIds }
  })
    .populate('course', 'courseName courseCode')
    .populate('submissions.student', 'firstName lastName email')
    .sort({ dueDate: -1 });

  console.log('Found assignments:', assignments.length);

  // Map assignments with student's submission data
  const assignmentsWithStatus = assignments.map(assignment => {
    const assignmentObj = assignment.toObject();
    
    // Find student's submission
    const studentSubmission = assignmentObj.submissions?.find(
      sub => sub.student._id.toString() === studentId.toString()
    );

    console.log(`Assignment "${assignmentObj.title}":`, {
      totalSubmissions: assignmentObj.submissions?.length || 0,
      hasStudentSubmission: !!studentSubmission,
      studentSubmissionStatus: studentSubmission?.status
    });

    return {
      ...assignmentObj,
      submitted: !!studentSubmission,
      studentSubmission: studentSubmission || null,
    };
  });

  return assignmentsWithStatus;
};

// Get assignment details
const getAssignmentDetails = async (assignmentId, studentId) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('course', 'courseName courseCode faculty')
    .populate('submissions.student', 'firstName lastName email');

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: assignment.course._id,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  const assignmentObj = assignment.toObject();
  
  // Find student's submission
  const studentSubmission = assignmentObj.submissions?.find(
    sub => sub.student._id.toString() === studentId.toString()
  );

  return {
    ...assignmentObj,
    submitted: !!studentSubmission,
    studentSubmission: studentSubmission || null,
  };
};

// Submit assignment
const submitAssignment = async (assignmentId, studentId, submissionData) => {
  console.log('=== SUBMIT ASSIGNMENT DEBUG ===');
  console.log('Assignment ID:', assignmentId);
  console.log('Student ID:', studentId);
  console.log('Submission Data:', JSON.stringify(submissionData, null, 2));

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  console.log('Assignment found:', assignment.title);

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: assignment.course,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  console.log('Enrollment verified');

  // Check if already submitted
  const existingSubmission = assignment.submissions.find(
    sub => sub.student.toString() === studentId.toString()
  );

  if (existingSubmission) {
    throw new ApiError(400, 'Assignment already submitted. Contact your instructor to resubmit.');
  }

  console.log('No existing submission found');

  // Check if submission is late
  const isLate = new Date() > new Date(assignment.dueDate);
  
  // Prepare files array
  const files = [];
  if (submissionData.submissionUrl) {
    files.push(submissionData.submissionUrl);
  }

  // Create submission object
  const submission = {
    student: studentId,
    submittedAt: new Date(),
    submissionText: submissionData.submissionText || submissionData.comments || '',
    files: files,
    status: isLate ? 'late' : 'submitted',
    feedback: null,
    grade: null,
  };

  console.log('=== SUBMISSION OBJECT DETAILS ===');
  console.log('submissionData.submissionText:', submissionData.submissionText);
  console.log('submissionData.comments:', submissionData.comments);
  console.log('Final submissionText value:', submission.submissionText);
  console.log('submissionText length:', submission.submissionText.length);
  console.log('Full submission object:', JSON.stringify(submission, null, 2));

  try {
    // Add submission to assignment
    assignment.submissions.push(submission);
    await assignment.save();
    console.log('Assignment saved successfully');
  } catch (saveError) {
    console.error('Error saving assignment:', saveError);
    throw new ApiError(500, `Failed to save submission: ${saveError.message}`);
  }

  // Send notification to instructor
  try {
    const course = await Course.findById(assignment.course).populate('faculty');
    if (course && course.faculty) {
      await Notification.create({
        user: course.faculty._id,
        type: 'assignment',
        title: 'New Assignment Submission',
        content: `A student has submitted "${assignment.title}"`,
        link: `/instructor/assignments/${assignment._id}/submissions`,
      });
    }
  } catch (notifError) {
    console.error('Error sending notification:', notifError);
    // Don't fail the submission if notification fails
  }

  // Return the updated assignment with populated data
  const updatedAssignment = await Assignment.findById(assignmentId)
    .populate('course', 'courseName courseCode')
    .populate('submissions.student', 'firstName lastName email');

  return {
    assignment: updatedAssignment,
    submission: submission,
    message: isLate ? 'Assignment submitted late' : 'Assignment submitted successfully'
  };
};

// Get student grades
const getStudentGrades = async (studentId) => {
  const grades = await Grade.find({ student: studentId })
    .populate('course', 'name code')
    .populate('assignment', 'title maxPoints dueDate')
    .sort({ gradedAt: -1 });

  return grades;
};

// Get course grades
const getCourseGrades = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  const grades = await Grade.find({ 
    course: courseId,
    student: studentId 
  })
    .populate('assignment', 'title maxPoints dueDate')
    .sort({ gradedAt: -1 });

  return grades;
};

// Get student attendance
const getStudentAttendance = async (studentId) => {
  const attendance = await Attendance.find({ student: studentId })
    .populate('course', 'name code')
    .sort({ date: -1 });

  return attendance;
};

// Get course attendance
const getCourseAttendance = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  const attendance = await Attendance.find({ 
    course: courseId,
    student: studentId 
  }).sort({ date: -1 });

  return attendance;
};

// Get student announcements
const getStudentAnnouncements = async (studentId) => {
  const enrollments = await Enrollment.find({ 
    student: studentId,
    status: 'active'
  }).select('course');
  
  const courseIds = enrollments.map(e => e.course);
  
  const announcements = await Announcement.find({
    course: { $in: courseIds }
  })
    .populate('course', 'name code')
    .sort({ createdAt: -1 });

  return announcements;
};

// Get course announcements
const getCourseAnnouncements = async (courseId, studentId) => {
  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  const announcements = await Announcement.find({ course: courseId })
    .sort({ createdAt: -1 });

  return announcements;
};

// Get student notifications
const getNotifications = async (studentId, options = {}) => {
  const { limit = 20, skip = 0 } = options;

  const notifications = await Notification.find({ user: studentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const unreadCount = await Notification.countDocuments({ 
    user: studentId, 
    isRead: false 
  });

  return {
    notifications,
    unreadCount,
    total: await Notification.countDocuments({ user: studentId })
  };
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, studentId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: studentId
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (studentId) => {
  const result = await Notification.updateMany(
    { user: studentId, isRead: false },
    { $set: { isRead: true } }
  );

  return {
    modifiedCount: result.modifiedCount,
    message: `${result.modifiedCount} notifications marked as read`
  };
};

export default {
  getDashboardData,
  getEnrolledCourses,
  getAvailableCourses,
  getCourseSuggestions,
  getCourseDetails,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  getStudentGrades,
  getCourseGrades,
  getStudentAttendance,
  getCourseAttendance,
  getStudentAnnouncements,
  getCourseAnnouncements,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
