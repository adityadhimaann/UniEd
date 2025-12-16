# Instructor Portal - UniEd

## Overview
The Instructor Portal is a comprehensive dashboard for faculty members to manage their courses, students, assignments, attendance, announcements, and grades.

## Features

### 1. **Dashboard**
- Overview statistics (total courses, students, assignments, announcements)
- Quick action buttons for common tasks
- Active/inactive course status

### 2. **Course Management**
- Create new courses with code, name, description, credits, and semester
- Update course information
- Delete courses (with confirmation)
- View enrolled students
- Toggle course active/inactive status

### 3. **Student Management**
- View all students enrolled in each course
- See student details (name, email, student ID)
- Access student profiles

### 4. **Assignment Management**
- Create assignments with title, description, due date, and points
- View all assignments for a course
- Update assignment details
- Delete assignments
- Grade student submissions with feedback
- Track assignment completion

### 5. **Attendance Tracking**
- Mark attendance for courses
- View attendance history by date range
- Filter attendance records
- Bulk attendance marking

### 6. **Announcements**
- Create announcements with priority levels (low, medium, high)
- Post course-specific announcements
- Update and delete announcements
- View announcement history

### 7. **Grade Management**
- Submit grades for students
- View all grades for a course
- Track grade distribution
- Export grades

### 8. **Analytics**
- View comprehensive statistics
- Track course performance
- Monitor student engagement

## API Endpoints

### Courses
- `GET /api/v1/instructor/courses` - Get all instructor's courses
- `POST /api/v1/instructor/courses` - Create a new course
- `PUT /api/v1/instructor/courses/:courseId` - Update a course
- `DELETE /api/v1/instructor/courses/:courseId` - Delete a course
- `GET /api/v1/instructor/courses/:courseId/students` - Get course students

### Assignments
- `POST /api/v1/instructor/assignments` - Create an assignment
- `GET /api/v1/instructor/courses/:courseId/assignments` - Get course assignments
- `PUT /api/v1/instructor/assignments/:assignmentId` - Update an assignment
- `DELETE /api/v1/instructor/assignments/:assignmentId` - Delete an assignment
- `POST /api/v1/instructor/assignments/:assignmentId/grade/:studentId` - Grade a submission

### Attendance
- `POST /api/v1/instructor/attendance` - Mark attendance
- `GET /api/v1/instructor/courses/:courseId/attendance` - Get course attendance

### Announcements
- `POST /api/v1/instructor/announcements` - Create an announcement
- `GET /api/v1/instructor/courses/:courseId/announcements` - Get course announcements
- `PUT /api/v1/instructor/announcements/:announcementId` - Update an announcement
- `DELETE /api/v1/instructor/announcements/:announcementId` - Delete an announcement

### Grades
- `POST /api/v1/instructor/grades` - Submit grades
- `GET /api/v1/instructor/courses/:courseId/grades` - Get course grades

### Statistics
- `GET /api/v1/instructor/statistics` - Get instructor statistics

## Access Control
- All routes require authentication
- Only users with `faculty` or `admin` role can access the instructor portal
- Instructors can only manage their own courses and data

## Frontend Routes
- `/instructor` - Dashboard home
- `/instructor/courses` - Course management
- `/instructor/courses/:courseId` - Course details
- `/instructor/assignments` - Assignment management (to be added)
- `/instructor/attendance` - Attendance tracking (to be added)
- `/instructor/announcements` - Announcements (to be added)
- `/instructor/analytics` - Analytics dashboard (to be added)

## How to Access
1. Login with a faculty account
2. Click the "Instructor Portal" button in the top navigation bar
3. Navigate through the sidebar menu

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Role-based access control (RBAC)

### Frontend
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (for animations)
- React Router (for navigation)

## File Structure

### Backend
```
backend/src/
├── controllers/
│   └── instructorController.js    # Controller methods
├── services/
│   └── instructorService.js       # Business logic
├── routes/
│   └── instructorRoutes.js        # API routes
└── models/
    ├── Course.js
    ├── Assignment.js
    ├── Attendance.js
    ├── Announcement.js
    ├── Grade.js
    └── Enrollment.js
```

### Frontend
```
frontend/src/
├── components/
│   └── instructor/
│       ├── InstructorDashboard.tsx   # Dashboard page
│       ├── CoursesManagement.tsx     # Course management
│       └── CourseDetails.tsx         # Course details
├── services/
│   └── instructorService.ts          # API service
└── pages/
    └── InstructorPortal.tsx          # Layout wrapper
```

## Security Features
- JWT authentication required for all endpoints
- Role-based access control (faculty/admin only)
- Instructor can only modify their own courses
- Authorization checks on all operations
- Secure password reset functionality

## Future Enhancements
- Assignment submission viewing and grading interface
- Detailed analytics and reports
- Bulk operations (e.g., bulk grading)
- Export functionality (CSV, PDF)
- Email notifications for announcements
- Calendar integration
- File upload for course materials
- Discussion forums
- Live class scheduling
- Automated grade calculations

## Development

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Setup
1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start backend server:
```bash
cd backend
npm run dev
```

4. Start frontend server:
```bash
cd frontend
npm run dev
```

### Environment Variables
```
# Backend .env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/unied
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:8080
```

## Testing
- Create a faculty account or update an existing user's role to "faculty"
- Login and access the Instructor Portal
- Test CRUD operations for courses, assignments, etc.

## Support
For issues or questions, please contact the development team.
