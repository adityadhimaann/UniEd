import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import User from './src/models/User.js';

dotenv.config();

const reassignCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'unied',
    });
    console.log('Connected to MongoDB');

    // Find all faculty members
    const allFaculty = await User.find({ role: 'faculty' });
    console.log('\nAll Faculty Members:');
    allFaculty.forEach((f, i) => {
      console.log(`${i + 1}. ${f.email} - ${f.firstName} ${f.lastName} (ID: ${f._id})`);
    });

    // Distribute courses among faculty
    const courses = await Course.find();
    console.log(`\nFound ${courses.length} courses`);

    if (allFaculty.length === 0) {
      console.log('No faculty found!');
      process.exit(1);
    }

    // Assign each course to a faculty member (round-robin)
    for (let i = 0; i < courses.length; i++) {
      const facultyIndex = i % allFaculty.length;
      const faculty = allFaculty[facultyIndex];
      
      courses[i].faculty = faculty._id;
      await courses[i].save();
      
      console.log(`Assigned ${courses[i].courseCode} to ${faculty.email}`);
    }

    console.log('\nCourses reassigned successfully!');
    
    // Show final distribution
    console.log('\nFinal Distribution:');
    for (const faculty of allFaculty) {
      const facultyCourses = await Course.find({ faculty: faculty._id });
      console.log(`\n${faculty.email}:`);
      facultyCourses.forEach(c => console.log(`  - ${c.courseCode}: ${c.courseName}`));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

reassignCourses();
