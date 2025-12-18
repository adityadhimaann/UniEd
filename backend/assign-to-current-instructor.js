import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import User from './src/models/User.js';

dotenv.config();

const assignToInstructor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('Connected to MongoDB');

    // Find the specific instructor
    const targetEmail = 'dhimanaditya56@gmail.com';
    const instructor = await User.findOne({ email: targetEmail });

    if (!instructor) {
      console.log(`Instructor ${targetEmail} not found!`);
      console.log('\nCreating instructor account...');
      
      // Create the instructor if doesn't exist
      const newInstructor = await User.create({
        email: targetEmail,
        firstName: 'Aditya',
        lastName: 'Dhiman',
        role: 'faculty',
        isActive: true,
      });
      
      console.log(`Created instructor: ${newInstructor.email}`);
      
      // Assign all courses to this new instructor
      const result = await Course.updateMany({}, { faculty: newInstructor._id });
      console.log(`\nAssigned ${result.modifiedCount} courses to ${targetEmail}`);
    } else {
      console.log(`Found instructor: ${instructor.email} - ${instructor.firstName} ${instructor.lastName}`);
      
      // Assign all courses to this instructor
      const result = await Course.updateMany({}, { faculty: instructor._id });
      console.log(`\nAssigned ${result.modifiedCount} courses to ${targetEmail}`);
    }

    // Show all courses for verification
    const courses = await Course.find({ faculty: instructor ? instructor._id : undefined }).populate('faculty', 'email firstName lastName');
    console.log(`\nCourses for ${targetEmail}:`);
    courses.forEach(c => console.log(`  - ${c.courseCode}: ${c.courseName}`));

    await mongoose.connection.close();
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

assignToInstructor();
