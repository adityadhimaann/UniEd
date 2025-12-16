import Joi from 'joi';

// Auth validators
export const registerValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('student', 'faculty', 'admin').required(),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
  studentId: Joi.string().when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  employeeId: Joi.string().when('role', {
    is: Joi.valid('faculty', 'admin'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  department: Joi.string().optional(),
  semester: Joi.number().min(1).max(12).optional(),
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenValidator = Joi.object({
  refreshToken: Joi.string().required(),
});

// Course validators
export const createCourseValidator = Joi.object({
  courseCode: Joi.string().required(),
  courseName: Joi.string().required(),
  description: Joi.string().optional(),
  credits: Joi.number().min(1).max(6).required(),
  department: Joi.string().required(),
  semester: Joi.number().min(1).max(12).required(),
  faculty: Joi.string().required(),
  maxStudents: Joi.number().min(1).optional(),
});

// Assignment validators
export const createAssignmentValidator = Joi.object({
  course: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  totalMarks: Joi.number().min(1).required(),
  dueDate: Joi.date().required(),
});

// Grade validators
export const addGradeValidator = Joi.object({
  student: Joi.string().required(),
  course: Joi.string().required(),
  semester: Joi.number().min(1).max(12).required(),
  assessments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('assignment', 'quiz', 'mid', 'final').required(),
      name: Joi.string().required(),
      marks: Joi.number().min(0).required(),
      maxMarks: Joi.number().min(1).required(),
    })
  ),
});

// Message validators
export const sendMessageValidator = Joi.object({
  receiver: Joi.string().required(),
  subject: Joi.string().required(),
  content: Joi.string().required(),
  parentMessage: Joi.string().optional(),
});

// Announcement validators
export const createAnnouncementValidator = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  targetAudience: Joi.string().valid('all', 'students', 'faculty').optional(),
  course: Joi.string().optional(),
  expiresAt: Joi.date().optional(),
});
