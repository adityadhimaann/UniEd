import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/Course.js';

dotenv.config();

const addCourseContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a course (you can change the courseCode to match your course)
    const courseCode = process.argv[2] || 'CS101';
    const course = await Course.findOne({ courseCode });

    if (!course) {
      console.log(`Course with code ${courseCode} not found`);
      console.log('Usage: node add-course-content.js <COURSE_CODE>');
      process.exit(1);
    }

    console.log(`Found course: ${course.courseName}`);

    // Add sample videos
    course.videos = [
      {
        title: 'Introduction to React JS',
        url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        description: 'Learn the basics of React JS and component-based architecture',
        duration: '45:30',
        order: 1,
        isPublic: false,
      },
      {
        title: 'React Hooks Deep Dive',
        url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
        description: 'Understanding useState, useEffect, and custom hooks',
        duration: '1:12:45',
        order: 2,
        isPublic: false,
      },
      {
        title: 'State Management with Redux',
        url: 'https://www.youtube.com/watch?v=CVpUuw9XSjY',
        description: 'Learn how to manage global state in React applications',
        duration: '58:20',
        order: 3,
        isPublic: false,
      },
      {
        title: 'React Router and Navigation',
        url: 'https://www.youtube.com/watch?v=Law7wfdg_ls',
        description: 'Building single-page applications with React Router',
        duration: '42:15',
        order: 4,
        isPublic: false,
      },
    ];

    // Add sample materials
    course.materials = [
      {
        title: 'React JS Official Documentation',
        type: 'link',
        url: 'https://react.dev/',
        description: 'Official React documentation and guides',
        uploadedAt: new Date(),
      },
      {
        title: 'React Cheat Sheet',
        type: 'pdf',
        url: 'https://devhints.io/react',
        description: 'Quick reference guide for React concepts',
        size: '2.5 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'Course Syllabus',
        type: 'pdf',
        url: 'https://example.com/syllabus.pdf',
        description: 'Complete course syllabus and schedule',
        size: '1.2 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'Assignment Guidelines',
        type: 'doc',
        url: 'https://example.com/guidelines.doc',
        description: 'Guidelines for completing course assignments',
        size: '850 KB',
        uploadedAt: new Date(),
      },
    ];

    // Add learning outcomes
    course.learningOutcomes = [
      'Understand the fundamentals of React JS and component-based architecture',
      'Build interactive user interfaces using React components',
      'Manage application state using hooks and context',
      'Implement routing and navigation in single-page applications',
      'Apply best practices for React application development',
      'Debug and optimize React applications for performance',
    ];

    // Add prerequisites
    course.prerequisites = [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Understanding of ES6+ JavaScript features',
      'Familiarity with npm and package management',
      'Basic understanding of web development concepts',
    ];

    await course.save();
    console.log('✅ Course content added successfully!');
    console.log(`Videos: ${course.videos.length}`);
    console.log(`Materials: ${course.materials.length}`);
    console.log(`Learning Outcomes: ${course.learningOutcomes.length}`);
    console.log(`Prerequisites: ${course.prerequisites.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addCourseContent();
