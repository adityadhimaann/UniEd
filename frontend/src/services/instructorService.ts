import api from '@/lib/api';

export const instructorService = {
  // Get instructor's courses
  async getMyCourses() {
    const response = await api.get('/instructor/courses');
    return response.data;
  },

  // Create a new course
  async createCourse(courseData: {
    code: string;
    name: string;
    description: string;
    credits: number;
    semester: number;
    department: string;
    schedule?: Array<{ day: string; startTime: string; endTime: string; room: string }>;
  }) {
    const response = await api.post('/instructor/courses', courseData);
    return response.data;
  },

  // Update course
  async updateCourse(courseId: string, updates: any) {
    const response = await api.put(`/instructor/courses/${courseId}`, updates);
    return response.data;
  },

  // Delete course
  async deleteCourse(courseId: string) {
    const response = await api.delete(`/instructor/courses/${courseId}`);
    return response.data;
  },

  // Get course students
  async getCourseStudents(courseId: string) {
    const response = await api.get(`/instructor/courses/${courseId}/students`);
    return response.data;
  },

  // Create assignment
  async createAssignment(assignmentData: {
    course: string;
    title: string;
    description: string;
    dueDate: string;
    totalPoints: number;
    attachments?: string[];
  }) {
    const response = await api.post('/instructor/assignments', assignmentData);
    return response.data;
  },

  // Get course assignments
  async getCourseAssignments(courseId: string) {
    const response = await api.get(`/instructor/courses/${courseId}/assignments`);
    return response.data;
  },

  // Get assignment submissions
  async getAssignmentSubmissions(assignmentId: string) {
    const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  // Update assignment
  async updateAssignment(assignmentId: string, updates: any) {
    const response = await api.put(`/instructor/assignments/${assignmentId}`, updates);
    return response.data;
  },

  // Delete assignment
  async deleteAssignment(assignmentId: string) {
    const response = await api.delete(`/instructor/assignments/${assignmentId}`);
    return response.data;
  },

  // Grade submission
  async gradeSubmission(assignmentId: string, studentId: string, grade: number, feedback: string) {
    const response = await api.post(`/instructor/assignments/${assignmentId}/grade/${studentId}`, {
      grade,
      feedback,
    });
    return response.data;
  },

  // Review submission (approve/disapprove/viewed)
  async reviewSubmission(assignmentId: string, studentId: string, reviewStatus: 'viewed' | 'approved' | 'disapproved', feedback?: string) {
    const response = await api.post(`/instructor/assignments/${assignmentId}/review/${studentId}`, {
      reviewStatus,
      feedback,
    });
    return response.data;
  },

  // Mark attendance
  async markAttendance(courseId: string, date: string, attendanceRecords: Array<{ student: string; status: string }>) {
    const response = await api.post('/instructor/attendance', {
      courseId,
      date,
      attendanceRecords,
    });
    return response.data;
  },

  // Get course attendance
  async getCourseAttendance(courseId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/instructor/courses/${courseId}/attendance?${params}`);
    return response.data;
  },

  // Create announcement
  async createAnnouncement(announcementData: {
    course: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const response = await api.post('/instructor/announcements', announcementData);
    return response.data;
  },

  // Get course announcements
  async getCourseAnnouncements(courseId: string) {
    const response = await api.get(`/instructor/courses/${courseId}/announcements`);
    return response.data;
  },

  // Update announcement
  async updateAnnouncement(announcementId: string, updates: any) {
    const response = await api.put(`/instructor/announcements/${announcementId}`, updates);
    return response.data;
  },

  // Delete announcement
  async deleteAnnouncement(announcementId: string) {
    const response = await api.delete(`/instructor/announcements/${announcementId}`);
    return response.data;
  },

  // Get instructor statistics
  async getStatistics() {
    const response = await api.get('/instructor/statistics');
    return response.data;
  },

  // Submit grades
  async submitGrades(courseId: string, grades: Array<{ student: string; grade: string; semester: string; type: string }>) {
    const response = await api.post('/instructor/grades', {
      courseId,
      grades,
    });
    return response.data;
  },

  // Get course grades
  async getCourseGrades(courseId: string) {
    const response = await api.get(`/instructor/courses/${courseId}/grades`);
    return response.data;
  },

  // Get enrollment requests
  async getEnrollmentRequests(status?: string, courseId?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (courseId) params.append('courseId', courseId);
    
    const response = await api.get(`/course-enrollment-requests?${params}`);
    return response.data;
  },

  // Respond to enrollment request
  async respondToEnrollmentRequest(requestId: string, status: 'approved' | 'rejected', responseMessage?: string) {
    const response = await api.patch(`/course-enrollment-requests/${requestId}`, {
      status,
      responseMessage,
    });
    return response.data;
  },
};
