import api from '@/lib/api';

// Student Dashboard API
export const studentService = {
  // Get dashboard data
  async getDashboard() {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Courses
  async getMyCourses() {
    const response = await api.get('/student/courses');
    return response.data;
  },

  async getCourseDetails(courseId: string) {
    const response = await api.get(`/student/courses/${courseId}`);
    return response.data;
  },

  // Assignments
  async getMyAssignments() {
    const response = await api.get('/student/assignments');
    return response.data;
  },

  async getAssignmentDetails(assignmentId: string) {
    const response = await api.get(`/student/assignments/${assignmentId}`);
    return response.data;
  },

  async submitAssignment(assignmentId: string, data: {
    submissionUrl?: string;
    comments?: string;
  }) {
    const response = await api.post(`/student/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  // Grades
  async getMyGrades() {
    const response = await api.get('/student/grades');
    return response.data;
  },

  async getCourseGrades(courseId: string) {
    const response = await api.get(`/student/courses/${courseId}/grades`);
    return response.data;
  },

  // Course Suggestions and Available Courses
  async getCourseSuggestions() {
    const response = await api.get('/student/course-suggestions');
    return response.data;
  },

  async getAvailableCourses() {
    const response = await api.get('/student/available-courses');
    return response.data;
  },

  async enrollInCourse(courseId: string) {
    const response = await api.post(`/student/courses/${courseId}/enroll`);
    return response.data;
  },

  // Attendance
  async getMyAttendance() {
    const response = await api.get('/student/attendance');
    return response.data;
  },

  async getCourseAttendance(courseId: string) {
    const response = await api.get(`/student/courses/${courseId}/attendance`);
    return response.data;
  },

  // Announcements
  async getMyAnnouncements() {
    const response = await api.get('/student/announcements');
    return response.data;
  },

  async getCourseAnnouncements(courseId: string) {
    const response = await api.get(`/student/courses/${courseId}/announcements`);
    return response.data;
  },
};
