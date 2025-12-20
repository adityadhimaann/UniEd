# Faculty Assignment Submission Viewing - Backend Implementation

## Overview
Complete backend system for faculty to view and grade student assignment submissions.

## Backend Changes

### 1. Instructor Service (`backend/src/services/instructorService.js`)

#### Updated: `getCourseAssignments(courseId, instructorId)`
- Now populates `submissions.student` with student details
- Adds submission statistics to each assignment:
  - `total`: Total number of submissions
  - `graded`: Number of graded submissions
  - `pending`: Number of submissions awaiting grading

**Response Structure:**
```javascript
{
  _id: "assignment_id",
  title: "Assignment Title",
  description: "Description",
  totalMarks: 100,
  dueDate: "2024-01-15",
  course: { courseCode, courseName },
  submissions: [
    {
      student: { _id, firstName, lastName, email, studentId },
      submittedAt: "2024-01-10",
      submissionText: "Student's answer",
      files: ["url1", "url2"],
      grade: null,
      feedback: null,
      status: "submitted"
    }
  ],
  submissionStats: {
    total: 5,
    graded: 2,
    pending: 3
  }
}
```

#### New: `getAssignmentSubmissions(assignmentId, instructorId)`
- Retrieves all submissions for a specific assignment
- Includes full student details
- Verifies instructor authorization

**Response Structure:**
```javascript
{
  assignment: {
    _id, title, description, totalMarks, dueDate, course
  },
  submissions: [
    {
      student: { _id, firstName, lastName, email, studentId },
      submittedAt: Date,
      submissionText: String,
      files: [String],
      grade: Number | null,
      feedback: String | null,
      status: "submitted" | "graded" | "late"
    }
  ]
}
```

#### Updated: `gradeSubmission(assignmentId, studentId, instructorId, gradeData)`
- Now accepts `gradeData` object with `{ grade, feedback }`
- Updates submission status to 'graded'
- Sends notification to student
- Returns updated assignment and submission

### 2. Instructor Controller (`backend/src/controllers/instructorController.js`)

#### New: `getAssignmentSubmissions`
```javascript
GET /api/instructor/assignments/:assignmentId/submissions
```
- Retrieves all submissions for an assignment
- Requires authentication and faculty role
- Returns assignment details and all submissions

#### Updated: `gradeSubmission`
```javascript
POST /api/instructor/assignments/:assignmentId/grade/:studentId
Body: { grade: Number, feedback: String }
```
- Grades a specific student's submission
- Sends notification to student
- Updates submission status

### 3. Routes (`backend/src/routes/instructorRoutes.js`)

Added new route:
```javascript
router.get('/assignments/:assignmentId/submissions', instructorController.getAssignmentSubmissions);
```

### 4. Frontend Service (`frontend/src/services/instructorService.ts`)

Added new function:
```typescript
async getAssignmentSubmissions(assignmentId: string) {
  const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
  return response.data;
}
```

## API Endpoints

### Get Course Assignments (Enhanced)
```
GET /api/instructor/courses/:courseId/assignments
Authorization: Bearer {token}
Role: faculty, admin

Response:
{
  success: true,
  data: [
    {
      _id: "...",
      title: "Assignment 1",
      submissions: [...],
      submissionStats: {
        total: 10,
        graded: 5,
        pending: 5
      }
    }
  ]
}
```

### Get Assignment Submissions (New)
```
GET /api/instructor/assignments/:assignmentId/submissions
Authorization: Bearer {token}
Role: faculty, admin

Response:
{
  success: true,
  data: {
    assignment: {
      _id, title, description, totalMarks, dueDate, course
    },
    submissions: [
      {
        student: { _id, firstName, lastName, email },
        submittedAt: "2024-01-10T10:00:00Z",
        submissionText: "Answer text",
        files: ["http://..."],
        grade: null,
        feedback: null,
        status: "submitted"
      }
    ]
  }
}
```

### Grade Submission (Updated)
```
POST /api/instructor/assignments/:assignmentId/grade/:studentId
Authorization: Bearer {token}
Role: faculty, admin

Body:
{
  "grade": 85,
  "feedback": "Good work! Minor improvements needed."
}

Response:
{
  success: true,
  data: {
    assignment: {...},
    submission: {...},
    message: "Submission graded successfully"
  }
}
```

## Features

### For Faculty:

1. **View All Assignments**
   - See submission statistics (total, graded, pending)
   - Quick overview of assignment status

2. **View Submissions**
   - See all student submissions for an assignment
   - View submission text and files
   - See submission date and status
   - Filter by graded/ungraded

3. **Grade Submissions**
   - Assign numerical grade
   - Provide written feedback
   - Automatically notify student
   - Update submission status

4. **Download Files**
   - Access student-submitted files
   - View submission URLs

### Security:

- ✅ Authorization checks (only course instructor can view/grade)
- ✅ Role-based access control (faculty/admin only)
- ✅ JWT authentication required
- ✅ Validates assignment and course ownership

### Notifications:

- ✅ Student notified when assignment is graded
- ✅ Notification includes grade and assignment title
- ✅ Links to assignment for easy access

## Usage Example

### Frontend Implementation:

```typescript
// Get all assignments for a course
const assignments = await instructorService.getCourseAssignments(courseId);

// Each assignment now has:
assignments.forEach(assignment => {
  console.log(`${assignment.title}:`);
  console.log(`- Total submissions: ${assignment.submissionStats.total}`);
  console.log(`- Pending grading: ${assignment.submissionStats.pending}`);
});

// View submissions for specific assignment
const { assignment, submissions } = await instructorService.getAssignmentSubmissions(assignmentId);

submissions.forEach(sub => {
  console.log(`Student: ${sub.student.firstName} ${sub.student.lastName}`);
  console.log(`Submitted: ${sub.submittedAt}`);
  console.log(`Text: ${sub.submissionText}`);
  console.log(`Files: ${sub.files.join(', ')}`);
  console.log(`Status: ${sub.status}`);
});

// Grade a submission
await instructorService.gradeSubmission(assignmentId, studentId, {
  grade: 85,
  feedback: "Excellent work!"
});
```

## Database Schema

### Assignment Model - Submission Schema:
```javascript
{
  student: ObjectId (ref: 'User'),
  submittedAt: Date,
  submissionText: String,
  files: [String],
  grade: Number (nullable),
  feedback: String (nullable),
  status: String (enum: ['submitted', 'graded', 'late'])
}
```

## Next Steps for Frontend UI:

1. Create `SubmissionsView` component
2. Display list of submissions with student names
3. Add "View" button for each submission
4. Create grading modal with:
   - Student info
   - Submission text/files
   - Grade input field
   - Feedback textarea
   - Submit button
5. Show submission statistics on assignment cards
6. Add filters (all/graded/pending)
7. Add bulk grading capability

## Testing Checklist:

- [ ] Faculty can view all assignments with submission counts
- [ ] Faculty can view individual assignment submissions
- [ ] Faculty can see student details in submissions
- [ ] Faculty can view submitted text and files
- [ ] Faculty can grade submissions
- [ ] Students receive notification when graded
- [ ] Only course instructor can access submissions
- [ ] Submission status updates correctly
- [ ] Late submissions are marked appropriately
- [ ] File downloads work correctly

## Error Handling:

- ✅ 404: Assignment not found
- ✅ 403: Not authorized (not course instructor)
- ✅ 404: Submission not found
- ✅ 400: Invalid grade data
- ✅ 401: Not authenticated

## Performance Considerations:

- Submissions are populated only when needed
- Statistics calculated on-the-fly
- Indexes on Assignment.course and Assignment.submissions.student
- Efficient queries with proper population

