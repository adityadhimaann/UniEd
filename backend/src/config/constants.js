export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

export const PERMISSIONS = {
  student: [
    'read:own-profile',
    'update:own-profile',
    'read:courses',
    'enroll:courses',
    'submit:assignments',
    'read:own-grades',
    'send:messages',
    'read:announcements',
  ],
  faculty: [
    'read:all-profiles',
    'create:courses',
    'create:assignments',
    'grade:assignments',
    'mark:attendance',
    'create:announcements',
    'read:analytics',
  ],
  admin: [
    'all:permissions',
    'manage:users',
    'manage:courses',
    'system:settings',
  ],
};

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '30d', // 30 days - much longer session
  REFRESH_TOKEN: '90d', // 90 days - extended refresh period
};

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};

export const ASSIGNMENT_STATUS = {
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TARGET_AUDIENCE = {
  ALL: 'all',
  STUDENTS: 'students',
  FACULTY: 'faculty',
};

export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'assignment',
  GRADE: 'grade',
  ANNOUNCEMENT: 'announcement',
  MESSAGE: 'message',
};

export const FILE_UPLOAD = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
