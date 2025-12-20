import axios from 'axios';

// Test script to create a course with full content
// Usage: node test-create-course-with-content.js YOUR_AUTH_TOKEN

const API_URL = 'http://localhost:5001/api/v1';
const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide an authentication token');
  console.log('Usage: node test-create-course-with-content.js YOUR_AUTH_TOKEN');
  console.log('\nTo get your token:');
  console.log('1. Login to the application');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Application/Storage → Local Storage');
  console.log('4. Copy the value of "accessToken"');
  process.exit(1);
}

const courseData = {
  code: 'REACT101',
  name: 'React JS - Modern Web Development',
  description: 'Master React JS from fundamentals to advanced concepts. Learn to build modern, interactive web applications using React, hooks, state management, and best practices. This comprehensive course covers everything you need to become a proficient React developer.',
  credits: 4,
  semester: 1,
  department: 'Computer Science',
  maxStudents: 50,
  titleImage: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
  schedule: {
    days: ['Monday', 'Wednesday', 'Friday'],
    time: '10:00 AM - 11:30 AM',
    room: 'Room 101'
  },
  videos: [
    {
      title: 'React JS Crash Course - Introduction',
      url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
      description: 'Complete introduction to React JS. Learn about components, JSX, props, and the React ecosystem.',
      duration: '1:48:48',
      order: 1,
      isPublic: false
    },
    {
      title: 'React Hooks Tutorial - useState & useEffect',
      url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
      description: 'Deep dive into React Hooks. Master useState for state management and useEffect for side effects.',
      duration: '52:37',
      order: 2,
      isPublic: false
    },
    {
      title: 'React Context API & useContext Hook',
      url: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
      description: 'Learn how to manage global state using Context API and useContext hook without Redux.',
      duration: '38:15',
      order: 3,
      isPublic: false
    },
    {
      title: 'React Router v6 - Complete Guide',
      url: 'https://www.youtube.com/watch?v=Ul3y1LXxzdU',
      description: 'Build single-page applications with React Router. Learn routing, navigation, and protected routes.',
      duration: '1:15:22',
      order: 4,
      isPublic: false
    },
    {
      title: 'React Performance Optimization',
      url: 'https://www.youtube.com/watch?v=5fLW5Q5ODiE',
      description: 'Optimize React apps with useMemo, useCallback, React.memo, and code splitting techniques.',
      duration: '42:18',
      order: 5,
      isPublic: false
    }
  ],
  materials: [
    {
      title: 'React Official Documentation',
      type: 'link',
      url: 'https://react.dev/',
      description: 'The official React documentation with guides, API reference, and tutorials.'
    },
    {
      title: 'React Hooks Cheat Sheet',
      type: 'pdf',
      url: 'https://react-hooks-cheatsheet.com/',
      description: 'Quick reference guide for all React hooks with examples and use cases.',
      size: '1.8 MB'
    },
    {
      title: 'Modern React Best Practices 2024',
      type: 'pdf',
      url: 'https://github.com/alan2207/bulletproof-react',
      description: 'Comprehensive guide to React best practices, project structure, and patterns.',
      size: '3.2 MB'
    },
    {
      title: 'React Component Patterns',
      type: 'doc',
      url: 'https://www.patterns.dev/posts/react-patterns',
      description: 'Learn advanced React patterns: HOCs, Render Props, Compound Components, and more.',
      size: '2.1 MB'
    },
    {
      title: 'React TypeScript Cheatsheet',
      type: 'link',
      url: 'https://react-typescript-cheatsheet.netlify.app/',
      description: 'Complete TypeScript cheatsheet for React developers with practical examples.'
    }
  ],
  learningOutcomes: [
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
    'Debug React applications using React DevTools'
  ],
  prerequisites: [
    'Strong understanding of HTML5 and CSS3',
    'Proficiency in JavaScript (ES6+): arrow functions, destructuring, spread operator, modules',
    'Understanding of asynchronous JavaScript: Promises, async/await',
    'Familiarity with npm/yarn package managers',
    'Basic knowledge of Git and version control',
    'Understanding of REST APIs and HTTP requests',
    'Experience with browser DevTools for debugging'
  ]
};

async function createCourse() {
  try {
    console.log('🚀 Creating course with full content...\n');
    
    const response = await axios.post(
      `${API_URL}/instructor/courses/with-content`,
      courseData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Course created successfully!\n');
      console.log('Course Details:');
      console.log('='.repeat(70));
      console.log(`ID: ${response.data.data.course._id}`);
      console.log(`Code: ${response.data.data.course.courseCode}`);
      console.log(`Name: ${response.data.data.course.courseName}`);
      console.log(`\nContent Statistics:`);
      console.log(`📹 Videos: ${response.data.data.stats.videosAdded}`);
      console.log(`📚 Materials: ${response.data.data.stats.materialsAdded}`);
      console.log(`🎯 Learning Outcomes: ${response.data.data.stats.learningOutcomesAdded}`);
      console.log(`📋 Prerequisites: ${response.data.data.stats.prerequisitesAdded}`);
      console.log('='.repeat(70));
      console.log('\n🎉 Students can now enroll and access all content!');
    }
  } catch (error) {
    console.error('❌ Error creating course:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message}`);
      if (error.response.data.errors) {
        console.error('Errors:', error.response.data.errors);
      }
    } else {
      console.error(error.message);
    }
  }
}

createCourse();
