import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import Attendance from '../models/Attendance.js';
import ApiError from '../utils/ApiError.js';
import { sendNotification } from '../socket/socketHandler.js';
import Notification from '../models/Notification.js';

class ProgressService {
  // Get or create progress for a student in a course
  async getOrCreateProgress(studentId, courseId) {
    let progress = await Progress.findOne({ student: studentId, course: courseId })
      .populate('course', 'courseName courseCode credits');

    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        course: courseId,
      });
      await progress.populate('course', 'courseName courseCode credits');
    }

    return progress;
  }

  // Get student progress for a course
  async getStudentProgress(studentId, courseId) {
    const progress = await this.getOrCreateProgress(studentId, courseId);
    await this.updateProgress(studentId, courseId);
    
    return progress;
  }

  // Get all progress for a student
  async getAllStudentProgress(studentId) {
    const progressList = await Progress.find({ student: studentId })
      .populate('course', 'courseName courseCode credits faculty')
      .populate('course.faculty', 'firstName lastName email')
      .sort({ lastAccessed: -1 });

    return progressList;
  }

  // Update progress (recalculate everything)
  async updateProgress(studentId, courseId) {
    const progress = await Progress.findOne({ student: studentId, course: courseId });

    if (!progress) {
      return await this.getOrCreateProgress(studentId, courseId);
    }

    // Update assignments
    const assignments = await Assignment.find({ course: courseId });
    const studentSubmissions = assignments.filter(a => 
      a.submissions.some(s => s.student.toString() === studentId.toString())
    );

    const gradedSubmissions = studentSubmissions.filter(a => {
      const submission = a.submissions.find(s => s.student.toString() === studentId.toString());
      return submission && submission.grade !== null;
    });

    const totalGrade = gradedSubmissions.reduce((sum, a) => {
      const submission = a.submissions.find(s => s.student.toString() === studentId.toString());
      return sum + (submission.grade / a.totalMarks) * 100;
    }, 0);

    progress.assignments = {
      total: assignments.length,
      completed: studentSubmissions.length,
      pending: assignments.length - studentSubmissions.length,
      averageGrade: gradedSubmissions.length > 0 ? Math.round(totalGrade / gradedSubmissions.length) : 0,
    };

    // Update quizzes
    const quizzes = await Quiz.find({ course: courseId, isPublished: true });
    const completedQuizzes = quizzes.filter(q => 
      q.attempts.some(a => 
        a.student.toString() === studentId.toString() && a.submittedAt
      )
    );

    const totalScore = completedQuizzes.reduce((sum, q) => {
      const studentAttempts = q.attempts.filter(
        a => a.student.toString() === studentId.toString() && a.submittedAt
      );
      const bestAttempt = studentAttempts.reduce((best, current) => 
        current.percentage > best.percentage ? current : best
      , { percentage: 0 });
      return sum + bestAttempt.percentage;
    }, 0);

    progress.quizzes = {
      total: quizzes.length,
      completed: completedQuizzes.length,
      averageScore: completedQuizzes.length > 0 ? Math.round(totalScore / completedQuizzes.length) : 0,
    };

    // Update attendance
    const attendanceRecords = await Attendance.find({ 
      course: courseId,
      'records.student': studentId 
    });

    let totalClasses = 0;
    let presentCount = 0;

    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(r => r.student.toString() === studentId.toString());
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === 'present') {
          presentCount++;
        }
      }
    });

    progress.attendance = {
      total: totalClasses,
      present: presentCount,
      percentage: totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0,
    };

    // Calculate overall progress
    progress.calculateProgress();
    progress.lastAccessed = new Date();
    await progress.save();

    // Check if eligible for certificate
    if (progress.isCompleted && !progress.certificateIssued) {
      await this.issueCertificate(studentId, courseId);
    }

    return progress;
  }

  // Update module progress
  async updateModuleProgress(studentId, courseId, moduleId, moduleName, completed) {
    const progress = await this.getOrCreateProgress(studentId, courseId);

    let module = progress.modules.find(m => m.moduleId === moduleId);

    if (!module) {
      module = {
        moduleId,
        moduleName,
        completed: false,
        materials: [],
      };
      progress.modules.push(module);
    }

    module.completed = completed;
    if (completed && !module.completedAt) {
      module.completedAt = new Date();
    }

    progress.calculateProgress();
    await progress.save();

    return progress;
  }

  // Update material progress
  async updateMaterialProgress(studentId, courseId, moduleId, materialId, viewed, progressPercentage) {
    const progress = await this.getOrCreateProgress(studentId, courseId);

    let module = progress.modules.find(m => m.moduleId === moduleId);

    if (!module) {
      throw ApiError.notFound('Module not found in progress');
    }

    let material = module.materials.find(m => m.materialId.toString() === materialId.toString());

    if (!material) {
      material = {
        materialId,
        viewed: false,
        progress: 0,
      };
      module.materials.push(material);
    }

    material.viewed = viewed;
    material.progress = progressPercentage;
    if (viewed && !material.viewedAt) {
      material.viewedAt = new Date();
    }

    // Check if all materials in module are viewed
    const allViewed = module.materials.every(m => m.viewed);
    if (allViewed && !module.completed) {
      module.completed = true;
      module.completedAt = new Date();
    }

    progress.calculateProgress();
    await progress.save();

    return progress;
  }

  // Add time spent
  async addTimeSpent(studentId, courseId, minutes) {
    const progress = await this.getOrCreateProgress(studentId, courseId);

    progress.timeSpent += minutes;
    progress.lastAccessed = new Date();
    await progress.save();

    return progress;
  }

  // Issue certificate
  async issueCertificate(studentId, courseId) {
    const progress = await Progress.findOne({ student: studentId, course: courseId })
      .populate('course')
      .populate('student', 'firstName lastName email');

    if (!progress) {
      throw ApiError.notFound('Progress not found');
    }

    if (!progress.isCompleted) {
      throw ApiError.badRequest('Course not completed yet');
    }

    if (progress.certificateIssued) {
      throw ApiError.badRequest('Certificate already issued');
    }

    // Calculate final grade
    const finalPercentage = Math.round(
      (progress.assignments.averageGrade + progress.quizzes.averageScore) / 2
    );

    let grade = 'F';
    if (finalPercentage >= 90) grade = 'A+';
    else if (finalPercentage >= 85) grade = 'A';
    else if (finalPercentage >= 80) grade = 'B+';
    else if (finalPercentage >= 75) grade = 'B';
    else if (finalPercentage >= 70) grade = 'C+';
    else if (finalPercentage >= 65) grade = 'C';
    else if (finalPercentage >= 60) grade = 'D';

    // Create certificate
    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      completionDate: progress.completedAt,
      grade,
      percentage: finalPercentage,
      metadata: {
        totalHours: Math.round(progress.timeSpent / 60),
        instructor: progress.course.faculty,
      },
    });

    // Update progress
    progress.certificateIssued = true;
    progress.certificateIssuedAt = new Date();
    await progress.save();

    // Update enrollment
    await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { status: 'completed', finalGrade: grade }
    );

    // Send notification
    const notification = await Notification.create({
      user: studentId,
      type: 'certificate',
      title: 'Certificate Issued',
      message: `Congratulations! You've earned a certificate for "${progress.course.courseName}"`,
      metadata: {
        certificateId: certificate._id,
        courseId,
        grade,
      },
    });

    sendNotification(studentId.toString(), notification);

    return certificate;
  }

  // Get course progress statistics (for instructor)
  async getCourseProgressStatistics(courseId) {
    const progressList = await Progress.find({ course: courseId })
      .populate('student', 'firstName lastName email');

    const statistics = {
      totalStudents: progressList.length,
      averageProgress: progressList.length > 0
        ? Math.round(progressList.reduce((sum, p) => sum + p.overallProgress, 0) / progressList.length)
        : 0,
      completedStudents: progressList.filter(p => p.isCompleted).length,
      certificatesIssued: progressList.filter(p => p.certificateIssued).length,
      averageTimeSpent: progressList.length > 0
        ? Math.round(progressList.reduce((sum, p) => sum + p.timeSpent, 0) / progressList.length)
        : 0,
      progressDistribution: {
        '0-25': progressList.filter(p => p.overallProgress < 25).length,
        '25-50': progressList.filter(p => p.overallProgress >= 25 && p.overallProgress < 50).length,
        '50-75': progressList.filter(p => p.overallProgress >= 50 && p.overallProgress < 75).length,
        '75-100': progressList.filter(p => p.overallProgress >= 75).length,
      },
      students: progressList.map(p => ({
        student: p.student,
        overallProgress: p.overallProgress,
        lastAccessed: p.lastAccessed,
        isCompleted: p.isCompleted,
        certificateIssued: p.certificateIssued,
      })),
    };

    return statistics;
  }
}

export default new ProgressService();
