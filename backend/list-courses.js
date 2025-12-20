import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/Course.js';

dotenv.config();

const listCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const courses = await Course.find({}).select('courseCode courseName description');
    
    if (courses.length === 0) {
      console.log('No courses found in database');
    } else {
      console.log('Available courses:');
      console.log('='.repeat(60));
      courses.forEach(course => {
        console.log(`\nCode: ${course.courseCode}`);
        console.log(`Name: ${course.courseName}`);
        if (course.description) {
          console.log(`Description: ${course.description.substring(0, 80)}...`);
        }
      });
      console.log('\n' + '='.repeat(60));
      console.log(`\nTotal: ${courses.length} courses`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

listCourses();
