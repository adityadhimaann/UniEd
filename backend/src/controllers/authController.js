import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json(
    ApiResponse.created(
      user,
      'User registered successfully. Please verify your email.'
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Login successful'
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Access token refreshed successfully'
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res.status(200).json(
    ApiResponse.success(
      null,
      'Logout successful'
    )
  );
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  res.status(200).json(
    ApiResponse.success(
      user,
      'User profile retrieved successfully'
    )
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const result = await authService.forgotPassword(email);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Password reset email sent successfully'
    )
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const result = await authService.resetPassword(token, newPassword);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Password reset successful'
    )
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  // TODO: Implement email verification logic
  res.status(200).json(
    ApiResponse.success(
      null,
      'Email verified successfully (not implemented yet)'
    )
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const result = await authService.updateProfile(userId, updates);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Profile updated successfully'
    )
  );
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  if (!req.file) {
    throw ApiError.badRequest('Please upload a file');
  }

  const result = await authService.updateProfilePicture(userId, req.file.path);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Profile picture updated successfully'
    )
  );
});

export const setPasswordAndRole = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { password, role, studentId, employeeId, department, semester } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  if (!role || !['student', 'instructor', 'faculty', 'parent'].includes(role)) {
    throw new ApiError(400, 'Valid role (student, instructor, faculty, or parent) is required');
  }

  const result = await authService.setPasswordAndRole(userId, {
    password,
    role,
    studentId,
    employeeId,
    department,
    semester
  });

  res.status(200).json(
    ApiResponse.success(
      result,
      'Password and role set successfully'
    )
  );
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await authService.completeOnboarding(userId);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Onboarding completed successfully'
    )
  );
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await authService.deleteAccount(userId);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Account deleted successfully'
    )
  );
});
