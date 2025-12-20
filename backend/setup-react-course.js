import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/Course.js';
import User from './src/models/User.js';

dotenv.config();

const setupReactCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Search for React course with multiple criteria
    let course = await Course.findOne({
      $or: [
        { courseName: { $regex: /react/i } },
        { courseCode: { $regex: /react/i } },
        { description: { $regex: /react/i } }
      ]
    }).populate('faculty', 'firstName lastName');

    if (!course) {
      console.log('No React course found. Let me show you all courses:\n');
      const allCourses = await Course.find({}).select('courseCode courseName').limit(10);
      
      if (allCourses.length === 0) {
        console.log('No courses exist in database. Creating a new React course...\n');
        
        // Find an instructor
        const instructor = await User.findOne({ role: 'instructor' });
        
        if (!instructor) {
          console.log('❌ No instructor found. Creating a default instructor...');
          // You'll need to create an instructor first
          console.log('Please run the application and create an instructor user first.');
          process.exit(1);
        }

        course = new Course({
          courseCode: 'REACT101',
          courseName: 'React JS - Modern Web Development',
          description: 'Master React JS from fundamentals to advanced concepts. Learn to build modern, interactive web applications using React, hooks, state management, and best practices.',
          credits: 4,
          department: 'Computer Science',
          semester: 1,
          faculty: instructor._id,
          maxStudents: 50,
          isActive: true,
          titleImage: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
        });
        
        console.log(`✅ Created new course: ${course.courseName}`);
      } else {
        console.log('Available courses:');
        allCourses.forEach((c, i) => {
          console.log(`${i + 1}. ${c.courseCode} - ${c.courseName}`);
        });
        console.log('\nPlease specify which course to add React content to.');
        console.log('You can modify the script to target a specific course code.');
        process.exit(0);
      }
    }

    console.log(`\n📚 Adding content to: ${course.courseName} (${course.courseCode})`);
    if (course.faculty) {
      console.log(`Instructor: ${course.faculty.firstName} ${course.faculty.lastName}`);
    }

    // Add comprehensive React JS videos
    course.videos = [
      {
        title: 'React JS Crash Course - Introduction',
        url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
        description: 'Complete introduction to React JS. Learn about components, JSX, props, and the React ecosystem.',
        duration: '1:48:48',
        order: 1,
        isPublic: false,
      },
      {
        title: 'React Hooks Tutorial - useState & useEffect',
        url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        description: 'Deep dive into React Hooks. Master useState for state management and useEffect for side effects.',
        duration: '52:37',
        order: 2,
        isPublic: false,
      },
      {
        title: 'React Context API & useContext Hook',
        url: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
        description: 'Learn how to manage global state using Context API and useContext hook without Redux.',
        duration: '38:15',
        order: 3,
        isPublic: false,
      },
      {
        title: 'React Router v6 - Complete Guide',
        url: 'https://www.youtube.com/watch?v=Ul3y1LXxzdU',
        description: 'Build single-page applications with React Router. Learn routing, navigation, and protected routes.',
        duration: '1:15:22',
        order: 4,
        isPublic: false,
      },
      {
        title: 'React Forms & Form Validation',
        url: 'https://www.youtube.com/watch?v=SdzMBWT2CDQ',
        description: 'Handle forms in React with controlled components, validation, and form libraries like Formik.',
        duration: '45:30',
        order: 5,
        isPublic: false,
      },
      {
        title: 'React Custom Hooks - Build Your Own',
        url: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
        description: 'Create reusable custom hooks to share logic across components. Learn best practices.',
        duration: '28:45',
        order: 6,
        isPublic: false,
      },
      {
        title: 'React Performance Optimization',
        url: 'https://www.youtube.com/watch?v=5fLW5Q5ODiE',
        description: 'Optimize React apps with useMemo, useCallback, React.memo, and code splitting techniques.',
        duration: '42:18',
        order: 7,
        isPublic: false,
      },
      {
        title: 'React + TypeScript Tutorial',
        url: 'https://www.youtube.com/watch?v=TiSGujM22OI',
        description: 'Learn how to use TypeScript with React for type-safe components and better developer experience.',
        duration: '1:02:35',
        order: 8,
        isPublic: false,
      },
      {
        title: 'State Management with Redux Toolkit',
        url: 'https://www.youtube.com/watch?v=9zySeP5vH9c',
        description: 'Master Redux Toolkit for complex state management in large React applications.',
        duration: '1:25:40',
        order: 9,
        isPublic: false,
      },
      {
        title: 'React Testing with Jest & React Testing Library',
        url: 'https://www.youtube.com/watch?v=8Xwq35cPwYg',
        description: 'Write unit and integration tests for React components. Learn testing best practices.',
        duration: '55:12',
        order: 10,
        isPublic: false,
      },
    ];

    // Add comprehensive course materials
    course.materials = [
      {
        title: 'React Official Documentation',
        type: 'link',
        url: 'https://react.dev/',
        description: 'The official React documentation with guides, API reference, and tutorials.',
        uploadedAt: new Date(),
      },
      {
        title: 'React Hooks Cheat Sheet',
        type: 'pdf',
        url: 'https://react-hooks-cheatsheet.com/',
        description: 'Quick reference guide for all React hooks with examples and use cases.',
        size: '1.8 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'Modern React Best Practices 2024',
        type: 'pdf',
        url: 'https://github.com/alan2207/bulletproof-react',
        description: 'Comprehensive guide to React best practices, project structure, and patterns.',
        size: '3.2 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'React Component Patterns',
        type: 'doc',
        url: 'https://www.patterns.dev/posts/react-patterns',
        description: 'Learn advanced React patterns: HOCs, Render Props, Compound Components, and more.',
        size: '2.1 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'React Interview Questions & Answers',
        type: 'pdf',
        url: 'https://github.com/sudheerj/reactjs-interview-questions',
        description: '500+ React interview questions with detailed answers and code examples.',
        size: '4.5 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'React Performance Optimization Guide',
        type: 'pdf',
        url: 'https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render',
        description: 'In-depth guide to identifying and fixing performance issues in React apps.',
        size: '1.9 MB',
        uploadedAt: new Date(),
      },
      {
        title: 'React TypeScript Cheatsheet',
        type: 'link',
        url: 'https://react-typescript-cheatsheet.netlify.app/',
        description: 'Complete TypeScript cheatsheet for React developers with practical examples.',
        uploadedAt: new Date(),
      },
      {
        title: 'React Testing Library Documentation',
        type: 'link',
        url: 'https://testing-library.com/docs/react-testing-library/intro/',
        description: 'Official documentation for testing React components with best practices.',
        uploadedAt: new Date(),
      },
      {
        title: 'React Project Starter Template',
        type: 'other',
        url: 'https://github.com/vitejs/vite/tree/main/packages/create-vite',
        description: 'Modern React project template with Vite, TypeScript, and essential tools.',
        size: '850 KB',
        uploadedAt: new Date(),
      },
      {
        title: 'React Ecosystem Libraries Guide',
        type: 'doc',
        url: 'https://github.com/enaqx/awesome-react',
        description: 'Curated list of React libraries, tools, and resources for every use case.',
        size: '1.5 MB',
        uploadedAt: new Date(),
      },
    ];

    // Add learning outcomes
    course.learningOutcomes = [
      'Build modern, interactive web applications using React JS',
      'Master React fundamentals: components, props, state, and JSX',
      'Implement React Hooks (useState, useEffect, useContext, useReducer, etc.)',
      'Create custom hooks for reusable component logic',
      'Manage application state with Context API and Redux Toolkit',
      'Build single-page applications with React Router',
      'Handle forms, validation, and user input effectively',
      'Optimize React applications for performance',
      'Write unit and integration tests for React components',
      'Use TypeScript with React for type-safe development',
      'Apply React best practices and design patterns',
      'Debug React applications using React DevTools',
    ];

    // Add prerequisites
    course.prerequisites = [
      'Strong understanding of HTML5 and CSS3',
      'Proficiency in JavaScript (ES6+): arrow functions, destructuring, spread operator, modules',
      'Understanding of asynchronous JavaScript: Promises, async/await',
      'Familiarity with npm/yarn package managers',
      'Basic knowledge of Git and version control',
      'Understanding of REST APIs and HTTP requests',
      'Experience with browser DevTools for debugging',
    ];

    await course.save();
    
    console.log('\n✅ React JS course content added successfully!\n');
    console.log('Course Details:');
    console.log('='.repeat(70));
    console.log(`Code: ${course.courseCode}`);
    console.log(`Name: ${course.courseName}`);
    console.log(`\nContent Added:`);
    console.log(`📹 Videos: ${course.videos.length} video tutorials`);
    console.log(`📚 Materials: ${course.materials.length} learning resources`);
    console.log(`🎯 Learning Outcomes: ${course.learningOutcomes.length} objectives`);
    console.log(`📋 Prerequisites: ${course.prerequisites.length} requirements`);
    console.log('='.repeat(70));
    console.log('\n🎉 SUCCESS! Students enrolled in this course can now access all content!');
    console.log('\n💡 How to view:');
    console.log('   1. Start the backend server (if not running)');
    console.log('   2. Login as a student enrolled in this course');
    console.log('   3. Go to Courses → Click on the React course');
    console.log('   4. Click the "Content" tab to see videos and materials');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

setupReactCourse();
