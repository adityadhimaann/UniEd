import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/Course.js';
import Enrollment from './src/models/Enrollment.js';
import Assignment from './src/models/Assignment.js';
import Attendance from './src/models/Attendance.js';

dotenv.config();

const deleteCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('✅ Connected to MongoDB');

    const courseCodesToDelete = ['CS101', 'MATH201', 'PHY101'];

    // Find courses to delete
    const courses = await Course.find({ courseCode: { $in: courseCodesToDelete } });
    
    if (courses.length === 0) {
      console.log('❌ No courses found with codes:', courseCodesToDelete.join(', '));
      process.exit(0);
    }

    console.log(`\n📚 Found ${courses.length} courses to delete:`);
    courses.forEach(course => {
      console.log(`   - ${course.courseCode}: ${course.courseName} (ID: ${course._id})`);
    });

    const courseIds = courses.map(c => c._id);

    // Delete related data
    console.log('\n🗑️  Deleting related data...');

    // Delete enrollments
    const enrollmentResult = await Enrollment.deleteMany({ course: { $in: courseIds } });
    console.log(`   ✓ Deleted ${enrollmentResult.deletedCount} enrollments`);

    // Delete assignments
    const assignmentResult = await Assignment.deleteMany({ course: { $in: courseIds } });
    console.log(`   ✓ Deleted ${assignmentResult.deletedCount} assignments`);

    // Delete attendance records
    const attendanceResult = await Attendance.deleteMany({ course: { $in: courseIds } });
    console.log(`   ✓ Deleted ${attendanceResult.deletedCount} attendance records`);

    // Delete courses
    const courseResult = await Course.deleteMany({ _id: { $in: courseIds } });
    console.log(`   ✓ Deleted ${courseResult.deletedCount} courses`);

    console.log('\n✅ Successfully deleted all courses and related data!');
    console.log('\nDeleted courses:');
    courses.forEach(course => {
      console.log(`   - ${course.courseCode}: ${course.courseName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting courses:', error);
    process.exit(1);
  }
};

deleteCourses();
