import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sanitizeUser } from '../utils/helpers.js';
import emailService from './emailService.js';
import Enrollment from '../models/Enrollment.js';
import CourseEnrollmentRequest from '../models/CourseEnrollmentRequest.js';
import Grade from '../models/Grade.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';

class AuthService {
  async register(userData) {
    const { email, password, role, firstName, lastName, studentId, employeeId, department, semester } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Check for duplicate student/employee ID
    if (studentId) {
      const existingStudent = await User.findOne({ 'academicInfo.studentId': studentId });
      if (existingStudent) {
        throw ApiError.conflict('Student ID already exists');
      }
    }

    if (employeeId) {
      const existingEmployee = await User.findOne({ 'academicInfo.employeeId': employeeId });
      if (existingEmployee) {
        throw ApiError.conflict('Employee ID already exists');
      }
    }

    // Create user
    try {
      const user = await User.create({
        email,
        password,
        role,
        firstName,
        lastName,
        authProvider: 'local',
        academicInfo: {
          studentId: role === 'student' ? studentId : undefined,
          employeeId: role !== 'student' ? employeeId : undefined,
          department,
          semester,
        },
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id,
      });

      // Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();

      // Send welcome email (async, don't wait for it)
      emailService.sendWelcomeEmail(user).catch(err => {
        console.error('Failed to send welcome email:', err);
      });

      return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // If it's a validation error, let it bubble up to the error handler
      if (error.name === 'ValidationError') {
        throw error;
      }
      // For any other error, wrap it in ApiError
      throw ApiError.internalError('Failed to create user account');
    }
  }

  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      if (user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated');
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw ApiError.unauthorized(error.message || 'Invalid refresh token');
    }
  }

  async logout(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Clear refresh token
    user.refreshToken = null;
    await user.save();

    return true;
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }

  async updateProfile(userId, updates) {
    const { firstName, lastName, phone, dateOfBirth, address, department, semester } = updates;

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Update top-level fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Update profile fields
    if (phone !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.phone = phone;
    }
    if (dateOfBirth !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.dateOfBirth = dateOfBirth;
    }
    if (address !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.address = address;
    }

    // Update academic info
    if (department !== undefined) {
      if (!user.academicInfo) user.academicInfo = {};
      user.academicInfo.department = department;
    }
    if (semester !== undefined) {
      if (!user.academicInfo) user.academicInfo = {};
      user.academicInfo.semester = semester;
    }

    // Save the user first
    await user.save();

    // Generate new tokens with just userId and role
    const accessToken = generateAccessToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });

    // Update refresh token and save
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async updateProfilePicture(userId, filePath) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Upload to Cloudinary
    const { uploadToCloudinary } = await import('../config/cloudinary.js');
    const result = await uploadToCloudinary(filePath, 'unied/profiles');

    // Update user avatar
    user.profile.avatar = result.secure_url;

    // Delete local file
    const fs = await import('fs/promises');
    await fs.unlink(filePath).catch(() => {});

    // Save the user first
    await user.save();

    // Generate new tokens with just userId and role
    const accessToken = generateAccessToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });

    // Update refresh token and save
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email) {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Return success message even if user doesn't exist (security best practice)
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send email
      await emailService.sendPasswordResetEmail(user, resetToken);

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      
      // If email fails, still keep the token for development/testing purposes
      // In production, you might want to remove it
      console.log(`\n⚠️  EMAIL NOT CONFIGURED - Reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}\n`);
      
      // Return success to user (for development, the token is logged)
      return { 
        message: 'Password reset initiated. Check console for reset link (email not configured)',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined 
      };
    }
  }

  async resetPassword(token, newPassword) {
    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return { message: 'Password reset successful. You can now login with your new password.' };
  }

  async setPasswordAndRole(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Update password
    user.password = data.password;

    // Update role
    user.role = data.role;

    // Ensure academicInfo object exists
    if (!user.academicInfo) {
      user.academicInfo = {};
    }

    // Update role-specific fields
    if (data.role === 'student') {
      if (data.studentId) user.academicInfo.studentId = data.studentId;
      if (data.department) user.academicInfo.department = data.department;
      if (data.semester) user.academicInfo.semester = data.semester;
    } else if (data.role === 'instructor' || data.role === 'faculty') {
      if (data.employeeId) user.academicInfo.employeeId = data.employeeId;
      if (data.department) user.academicInfo.department = data.department;
    }

    // Mark that setup is complete but not onboarding yet
    user.hasCompletedOnboarding = false;

    await user.save();

    // Generate new tokens with updated role
    const accessToken = generateAccessToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async completeOnboarding(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.hasCompletedOnboarding = true;
    await user.save();

    return {
      user: sanitizeUser(user),
      hasCompletedOnboarding: true,
    };
  }

  async deleteAccount(userId) {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Delete all related data in cascade
    try {
      // Delete enrollments
      await Enrollment.deleteMany({ student: userId });
      await Enrollment.deleteMany({ instructor: userId });

      // Delete course enrollment requests
      await CourseEnrollmentRequest.deleteMany({ student: userId });
      await CourseEnrollmentRequest.deleteMany({ instructor: userId });

      // Delete grades
      await Grade.deleteMany({ student: userId });
      await Grade.deleteMany({ instructor: userId });

      // Delete messages
      await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

      // Delete notifications
      await Notification.deleteMany({ user: userId });

      // Delete reviews
      await Review.deleteMany({ $or: [{ reviewedBy: userId }, { instructor: userId }] });

      // Delete assignments created by user
      await Assignment.deleteMany({ instructor: userId });

      // Delete attendance records
      await Attendance.deleteMany({ student: userId });

      // Delete announcements created by user
      await Announcement.deleteMany({ instructor: userId });

      // Finally, delete the user
      await User.findByIdAndDelete(userId);

      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw ApiError.internalError('Failed to delete account. Please try again later.');
    }
  }
}

export default new AuthService();
