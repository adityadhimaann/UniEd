import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import Enrollment from './src/models/Enrollment.js';
import Attendance from './src/models/Attendance.js';

dotenv.config();

const createAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('Connected to MongoDB');

    const studentEmail = 'dhimanaditya56@gmail.com';
    const student = await User.findOne({ email: studentEmail, role: 'student' });

    if (!student) {
      console.log('Student not found');
      process.exit(1);
    }

    // Get enrolled courses
    const enrollments = await Enrollment.find({ student: student._id, status: 'active' }).populate('course');
    console.log(`Found ${enrollments.length} enrollments`);

    // Create attendance for each course
    for (const enrollment of enrollments) {
      console.log(`\nCreating attendance for ${enrollment.course.courseCode}`);
      
      // Create 20 attendance records (15 present, 5 absent = 75%)
      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const status = i % 4 === 0 ? 'absent' : 'present';
        
        await Attendance.create({
          student: student._id,
          course: enrollment.course._id,
          date: date,
          status: status
        });
      }
      
      console.log(`Created 20 attendance records (75% present)`);
    }

    // Summary - add a small delay to ensure writes complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'present' });
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    console.log(`\n✓ Complete!`);
    console.log(`Total Attendance Records: ${totalAttendance}`);
    console.log(`Present: ${presentCount}`);
    console.log(`Attendance Rate: ${attendanceRate}%`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAttendance();
