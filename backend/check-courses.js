import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './src/models/Course.js';

dotenv.config();

const checkCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('Connected to MongoDB');

    const courses = await Course.find({}).select('courseCode courseName department semester isActive');
    console.log(`\nTotal courses in database: ${courses.length}\n`);
    
    courses.forEach(course => {
      console.log(`${course.courseCode} - ${course.courseName}`);
      console.log(`  Department: ${course.department}, Semester: ${course.semester}, Active: ${course.isActive}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCourses();
