import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import User from './src/models/User.js';
import Enrollment from './src/models/Enrollment.js';
import Assignment from './src/models/Assignment.js';
import Grade from './src/models/Grade.js';
import Attendance from './src/models/Attendance.js';

dotenv.config();

const enrollStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('Connected to MongoDB');

    // Find the student
    const studentEmail = 'dhimanaditya56@gmail.com';
    const student = await User.findOne({ email: studentEmail, role: 'student' });

    if (!student) {
      console.log(`Student ${studentEmail} not found!`);
      process.exit(1);
    }

    console.log(`Found student: ${student.firstName} ${student.lastName}`);

    // Get all courses
    const courses = await Course.find({ isActive: true }).limit(3);
    console.log(`\nFound ${courses.length} courses to enroll in`);

    // Enroll student in courses
    for (const course of courses) {
      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: student._id,
        course: course._id
      });

      if (existingEnrollment) {
        console.log(`Already enrolled in ${course.courseCode}`);
        continue;
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
        enrolledAt: new Date(),
        semester: course.semester
      });

      console.log(`✓ Enrolled in ${course.courseCode}: ${course.courseName}`);

      // Create some sample assignments for the course
      const assignment1 = await Assignment.create({
        course: course._id,
        title: `${course.courseCode} - Assignment 1`,
        description: 'Complete the first assignment for this course',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 100,
        createdBy: course.faculty
      });

      const assignment2 = await Assignment.create({
        course: course._id,
        title: `${course.courseCode} - Assignment 2`,
        description: 'Complete the second assignment for this course',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        totalMarks: 100,
        createdBy: course.faculty
      });

      console.log(`  Created 2 assignments`);

      // Submit first assignment with a grade
      await Grade.create({
        student: student._id,
        course: course._id,
        semester: course.semester,
        assessments: [{
          type: 'assignment',
          name: assignment1.title,
          marks: 85,
          maxMarks: 100,
          date: new Date()
        }]
      });

      console.log(`  Graded Assignment 1: 85/100`);

      // Create some attendance records
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await Attendance.create({
          student: student._id,
          course: course._id,
          date: date,
          status: i % 4 === 0 ? 'absent' : 'present' // 75% attendance
        });
      }

      console.log(`  Created 10 attendance records (75% present)`);
    }

    console.log('\n✓ Student enrollment complete!');

    // Show summary
    const enrollmentCount = await Enrollment.countDocuments({ student: student._id, status: 'active' });
    
    const enrolledCourses = await Enrollment.find({ student: student._id, status: 'active' }).select('course');
    const enrolledCourseIds = enrolledCourses.map(e => e.course);
    
    const assignmentCount = await Assignment.countDocuments({ 
      course: { $in: enrolledCourseIds }
    });
    const gradeCount = await Grade.countDocuments({ student: student._id });
    const attendanceCount = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'present' });

    console.log('\nSummary:');
    console.log(`- Enrolled Courses: ${enrollmentCount}`);
    console.log(`- Total Assignments: ${assignmentCount}`);
    console.log(`- Graded Assignments: ${gradeCount}`);
    console.log(`- Attendance Records: ${attendanceCount} (${presentCount} present)`);
    console.log(`- Attendance Rate: ${Math.round((presentCount / attendanceCount) * 100)}%`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

enrollStudent();
