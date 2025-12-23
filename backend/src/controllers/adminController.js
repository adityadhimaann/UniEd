import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';

// Get system statistics
const getStatistics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalEnrollments,
    totalAssignments,
    pendingSubmissions
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ isActive: true }),
    Enrollment.countDocuments(),
    Assignment.countDocuments(),
    Assignment.countDocuments({ 'submissions.status': 'submitted' })
  ]);

  const stats = {
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalEnrollments,
    totalAssignments,
    pendingSubmissions,
    usersByRole: {
      students: await User.countDocuments({ role: 'student' }),
      faculty: await User.countDocuments({ role: 'faculty' }),
      admin: await User.countDocuments({ role: 'admin' })
    }
  };

  res.status(200).json(
    ApiResponse.success(stats, 'Statistics retrieved successfully')
  );
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 50 } = req.query;

  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json(
    ApiResponse.success({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Users retrieved successfully')
  );
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Get user's enrollments
  const enrollments = await Enrollment.find({ student: userId })
    .populate('course', 'courseName courseCode');

  res.status(200).json(
    ApiResponse.success({
      user,
      enrollments
    }, 'User details retrieved successfully')
  );
});

// Update user status (activate/deactivate)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent deactivating yourself
  if (userId === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json(
    ApiResponse.success(user, `User ${isActive ? 'activated' : 'deactivated'} successfully`)
  );
});

// Update user role
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['student', 'faculty', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent changing your own role
  if (userId === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  user.role = role;
  await user.save();

  res.status(200).json(
    ApiResponse.success(user, 'User role updated successfully')
  );
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent deleting yourself
  if (userId === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  // Delete user's enrollments
  await Enrollment.deleteMany({ student: userId });

  // Delete user
  await User.findByIdAndDelete(userId);

  res.status(200).json(
    ApiResponse.success(null, 'User deleted successfully')
  );
});

// Get all courses
const getAllCourses = asyncHandler(async (req, res) => {
  const { isActive, search, page = 1, limit = 50 } = req.query;

  const query = {};
  
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { courseName: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } }
    ];
  }

  const courses = await Course.find(query)
    .populate('faculty', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Course.countDocuments(query);

  res.status(200).json(
    ApiResponse.success({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Courses retrieved successfully')
  );
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Delete course enrollments
  await Enrollment.deleteMany({ course: courseId });

  // Delete course assignments
  await Assignment.deleteMany({ course: courseId });

  // Delete course
  await Course.findByIdAndDelete(courseId);

  res.status(200).json(
    ApiResponse.success(null, 'Course deleted successfully')
  );
});

// Get system health
const getSystemHealth = asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  };

  res.status(200).json(
    ApiResponse.success(health, 'System health retrieved successfully')
  );
});

// Create backup (placeholder)
const createBackup = asyncHandler(async (req, res) => {
  // This is a placeholder - implement actual backup logic
  res.status(200).json(
    ApiResponse.success({
      message: 'Backup functionality not yet implemented',
      timestamp: new Date()
    }, 'Backup request received')
  );
});

export default {
  getStatistics,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getSystemHealth,
  createBackup
};
