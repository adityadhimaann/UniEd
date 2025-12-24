import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import authService from '../services/authService.js';
import otpService from '../services/otpService.js';

export const register = asyncHandler(async (req, res) => {
  console.log('📝 Registration request received:', { email: req.body.email, role: req.body.role });
  
  const result = await authService.register(req.body);
  
  console.log('✅ Registration successful, OTP sent to:', req.body.email);

  // In development, include OTP in response for easier testing
  const response = {
    ...result,
  };

  // Add development hint
  if (process.env.NODE_ENV === 'development') {
    response.devHint = 'Check backend console for OTP if email not received';
  }

  res.status(201).json(
    ApiResponse.created(
      response,
      'Registration successful. Please verify your email with the OTP sent to your email address.'
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

  // Use buffer instead of path for memory storage
  const result = await authService.updateProfilePicture(userId, req.file.buffer);

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

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  console.log('🔐 OTP verification request:', { email, otp });

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const result = await authService.verifyEmailOTP(email, otp);

  console.log('✅ OTP verified successfully for:', email);

  res.status(200).json(
    ApiResponse.success(
      result,
      'Email verified successfully'
    )
  );
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log('🔄 Resend OTP request for:', email);

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const result = await otpService.resendOTP(email, 'email_verification');

  console.log('✅ OTP resent successfully to:', email);

  res.status(200).json(
    ApiResponse.success(
      result,
      'OTP resent successfully'
    )
  );
});
