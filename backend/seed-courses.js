import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Course from './src/models/Course.js';
import User from './src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI + process.env.DB_NAME || 'mongodb://localhost:27017/unied';
console.log('Connecting to:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

const seedCourses = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users to debug
    const allUsers = await User.find();
    console.log('All users:', allUsers.map(u => ({ email: u.email, role: u.role })));

    // Find a faculty member (instructor)
    const faculty = await User.findOne({ role: 'faculty' });
    
    if (!faculty) {
      console.log('No faculty member found in the database. Please create a faculty account first.');
      console.log('Available roles:', allUsers.map(u => u.role));
      process.exit(1);
    }

    console.log(`Found instructor: ${faculty.firstName} ${faculty.lastName}`);

    // Sample courses
    const courses = [
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        description: 'Learn the fundamentals of programming and computational thinking',
        credits: 3,
        department: 'Computer Science',
        semester: 1,
        faculty: faculty._id,
        maxStudents: 50,
        isActive: true,
      },
      {
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        description: 'Advanced calculus including integration techniques and series',
        credits: 4,
        department: 'Mathematics',
        semester: 2,
        faculty: faculty._id,
        maxStudents: 40,
        isActive: true,
      },
      {
        courseCode: 'PHY101',
        courseName: 'Physics I',
        description: 'Introduction to mechanics, thermodynamics, and waves',
        credits: 4,
        department: 'Physics',
        semester: 1,
        faculty: faculty._id,
        maxStudents: 45,
        isActive: true,
      },
      {
        courseCode: 'ENG102',
        courseName: 'English Composition',
        description: 'Develop writing and critical thinking skills',
        credits: 3,
        department: 'English',
        semester: 1,
        faculty: faculty._id,
        maxStudents: 30,
        isActive: true,
      },
      {
        courseCode: 'CS202',
        courseName: 'Data Structures and Algorithms',
        description: 'Study of fundamental data structures and algorithmic techniques',
        credits: 4,
        department: 'Computer Science',
        semester: 3,
        faculty: faculty._id,
        maxStudents: 50,
        isActive: true,
      },
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`\nCreated ${createdCourses.length} courses:`);
    createdCourses.forEach(course => {
      console.log(`  - ${course.courseCode}: ${course.courseName}`);
    });

    console.log('\nCourse seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
