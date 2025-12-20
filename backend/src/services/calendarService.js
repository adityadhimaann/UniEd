import Assignment from '../models/Assignment.js';
import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';

class CalendarService {
  // Get upcoming events for a student (assignments, exams, attendance)
  async getUpcomingEvents(studentId) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get student's enrolled courses
    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'courseName courseCode');

    const courseIds = enrollments.map(e => e.course._id);

    // Get upcoming assignments
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      dueDate: { $gte: now, $lte: thirtyDaysFromNow }
    })
      .populate('course', 'courseName courseCode')
      .sort({ dueDate: 1 })
      .limit(10);

    // Get upcoming attendance sessions (if scheduled)
    const attendanceSessions = await Attendance.find({
      course: { $in: courseIds },
      date: { $gte: now, $lte: thirtyDaysFromNow }
    })
      .populate('course', 'courseName courseCode')
      .sort({ date: 1 })
      .limit(5);

    // Format events
    const events = [];

    // Add assignments
    assignments.forEach(assignment => {
      const daysUntil = Math.ceil((new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24));
      
      // Check if student has submitted
      const submission = assignment.submissions?.find(
        s => s.student.toString() === studentId.toString()
      );

      events.push({
        _id: assignment._id,
        type: 'assignment',
        title: assignment.title,
        description: assignment.description,
        courseName: `${assignment.course.courseCode} - ${assignment.course.courseName}`,
        courseId: assignment.course._id,
        date: assignment.dueDate,
        daysUntil,
        status: submission ? submission.status : 'not_submitted',
        isSubmitted: !!submission
      });
    });

    // Add attendance sessions
    attendanceSessions.forEach(session => {
      const daysUntil = Math.ceil((new Date(session.date) - now) / (1000 * 60 * 60 * 24));
      
      events.push({
        _id: session._id,
        type: 'attendance',
        title: 'Attendance Session',
        description: session.topic || 'Class attendance',
        courseName: `${session.course.courseCode} - ${session.course.courseName}`,
        courseId: session.course._id,
        date: session.date,
        daysUntil
      });
    });

    // Sort all events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
  }

  // Get academic calendar for a specific month
  async getMonthlyCalendar(studentId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get student's enrolled courses
    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'courseName courseCode');

    const courseIds = enrollments.map(e => e.course._id);

    // Get assignments for the month
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      dueDate: { $gte: startDate, $lte: endDate }
    })
      .populate('course', 'courseName courseCode')
      .sort({ dueDate: 1 });

    // Get attendance sessions for the month
    const attendanceSessions = await Attendance.find({
      course: { $in: courseIds },
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('course', 'courseName courseCode')
      .sort({ date: 1 });

    // Group events by date
    const calendar = {};

    assignments.forEach(assignment => {
      const dateKey = assignment.dueDate.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      
      const submission = assignment.submissions?.find(
        s => s.student.toString() === studentId.toString()
      );

      calendar[dateKey].push({
        type: 'assignment',
        title: assignment.title,
        courseName: assignment.course.courseName,
        courseCode: assignment.course.courseCode,
        time: assignment.dueDate,
        status: submission ? submission.status : 'not_submitted'
      });
    });

    attendanceSessions.forEach(session => {
      const dateKey = session.date.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      
      calendar[dateKey].push({
        type: 'attendance',
        title: 'Attendance',
        courseName: session.course.courseName,
        courseCode: session.course.courseCode,
        time: session.date,
        topic: session.topic
      });
    });

    return {
      year,
      month,
      calendar,
      totalEvents: Object.keys(calendar).length
    };
  }
}

export default new CalendarService();
