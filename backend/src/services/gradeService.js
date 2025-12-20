import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';

class GradeService {
  // Calculate overall grade for a student in a course
  async calculateCourseGrade(studentId, courseId) {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId });
    
    // Calculate assignment average from embedded submissions
    let totalAssignmentPoints = 0;
    let earnedAssignmentPoints = 0;
    let gradedSubmissions = 0;

    for (const assignment of assignments) {
      // Find student's submission in the embedded submissions array
      const submission = assignment.submissions?.find(
        s => s.student.toString() === studentId.toString()
      );
      
      if (submission && submission.grade !== undefined && submission.grade !== null) {
        totalAssignmentPoints += assignment.totalMarks || assignment.totalPoints || 100;
        earnedAssignmentPoints += submission.grade;
        gradedSubmissions++;
      }
    }

    const assignmentPercentage = gradedSubmissions > 0 
      ? (earnedAssignmentPoints / totalAssignmentPoints) * 100 
      : 0;

    // Get attendance percentage
    const attendanceRecords = await Attendance.find({ course: courseId });
    const studentAttendance = attendanceRecords.filter(record => 
      record.records && record.records.some(a => a.student.toString() === studentId.toString() && a.status === 'present')
    );
    const attendancePercentage = attendanceRecords.length > 0
      ? (studentAttendance.length / attendanceRecords.length) * 100
      : 0;

    // Calculate overall grade (70% assignments, 30% attendance)
    const overallPercentage = (assignmentPercentage * 0.7) + (attendancePercentage * 0.3);
    
    // Determine letter grade
    const letterGrade = this.getLetterGrade(overallPercentage);
    const gradePoint = this.getGradePoint(letterGrade);

    return {
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      letterGrade,
      gradePoint,
      assignmentPercentage: Math.round(assignmentPercentage * 100) / 100,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      totalAssignments: assignments.length,
      gradedAssignments: gradedSubmissions,
      credits: enrollment.course?.credits || 0
    };
  }

  // Get all grades for a student
  async getStudentGrades(studentId) {
    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'courseName courseCode credits faculty')
      .populate('course.faculty', 'firstName lastName');

    const grades = [];
    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const enrollment of enrollments) {
      if (!enrollment.course) continue;

      const gradeData = await this.calculateCourseGrade(studentId, enrollment.course._id);
      
      totalCredits += gradeData.credits;
      totalGradePoints += gradeData.gradePoint * gradeData.credits;

      grades.push({
        course: {
          _id: enrollment.course._id,
          name: enrollment.course.courseName,
          code: enrollment.course.courseCode,
          credits: gradeData.credits,
          faculty: enrollment.course.faculty
        },
        ...gradeData,
        enrolledAt: enrollment.enrolledAt
      });
    }

    // Calculate GPA
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Calculate grade distribution
    const gradeDistribution = this.calculateGradeDistribution(grades);

    // Calculate statistics
    const avgScore = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.overallPercentage, 0) / grades.length
      : 0;

    return {
      grades,
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      totalCourses: grades.length,
      avgScore: Math.round(avgScore * 100) / 100,
      gradeDistribution
    };
  }

  // Get detailed grade breakdown for a course
  async getCourseGradeBreakdown(studentId, courseId) {
    const assignments = await Assignment.find({ course: courseId })
      .sort({ dueDate: -1 });

    const assignmentGrades = assignments.map(assignment => {
      // Find student's submission in embedded submissions array
      const submission = assignment.submissions?.find(
        s => s.student.toString() === studentId.toString()
      );

      return {
        assignmentId: assignment._id,
        title: assignment.title,
        totalMarks: assignment.totalMarks || assignment.totalPoints || 100,
        earnedMarks: submission?.grade || 0,
        percentage: submission?.grade 
          ? (submission.grade / (assignment.totalMarks || assignment.totalPoints || 100)) * 100 
          : 0,
        status: submission?.status || 'not_submitted',
        submittedAt: submission?.submittedAt,
        gradedAt: submission?.gradedAt,
        feedback: submission?.feedback,
        dueDate: assignment.dueDate
      };
    });

    const courseGrade = await this.calculateCourseGrade(studentId, courseId);

    return {
      ...courseGrade,
      assignments: assignmentGrades
    };
  }

  // Helper: Get letter grade from percentage
  getLetterGrade(percentage) {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  // Helper: Get grade point from letter grade
  getGradePoint(letterGrade) {
    const gradePoints = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gradePoints[letterGrade] || 0;
  }

  // Helper: Calculate grade distribution
  calculateGradeDistribution(grades) {
    const distribution = {};
    grades.forEach(grade => {
      const letter = grade.letterGrade;
      distribution[letter] = (distribution[letter] || 0) + 1;
    });
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count
    }));
  }

  // Get semester-wise grades
  async getSemesterGrades(studentId) {
    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'courseName courseCode credits semester academicYear')
      .sort({ 'course.academicYear': -1, 'course.semester': -1 });

    const semesterMap = new Map();

    for (const enrollment of enrollments) {
      if (!enrollment.course) continue;

      const semester = enrollment.course.semester || 'Fall';
      const year = enrollment.course.academicYear || new Date().getFullYear();
      const key = `${semester} ${year}`;

      if (!semesterMap.has(key)) {
        semesterMap.set(key, {
          semester,
          year,
          courses: [],
          totalCredits: 0,
          gpa: 0
        });
      }

      const gradeData = await this.calculateCourseGrade(studentId, enrollment.course._id);
      const semesterData = semesterMap.get(key);
      
      semesterData.courses.push({
        course: enrollment.course,
        ...gradeData
      });
      semesterData.totalCredits += gradeData.credits;
    }

    // Calculate GPA for each semester
    const semesters = Array.from(semesterMap.values()).map(sem => {
      const totalGradePoints = sem.courses.reduce((sum, c) => 
        sum + (c.gradePoint * c.credits), 0
      );
      sem.gpa = sem.totalCredits > 0 
        ? Math.round((totalGradePoints / sem.totalCredits) * 100) / 100 
        : 0;
      return sem;
    });

    return semesters;
  }
}

export default new GradeService();
