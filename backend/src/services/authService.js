import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sanitizeUser } from '../utils/helpers.js';
import emailService from './emailService.js';

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
    const user = await User.create({
      email,
      password,
      role,
      profile: {
        firstName,
        lastName,
      },
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

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
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

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (phone !== undefined) user.profile.phone = phone;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.profile.address = address;

    // Update academic info
    if (department !== undefined) user.academicInfo.department = department;
    if (semester !== undefined) user.academicInfo.semester = semester;

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

    // Update role-specific fields
    if (data.role === 'student') {
      if (data.studentId) user.studentId = data.studentId;
      if (data.department) user.department = data.department;
      if (data.semester) user.semester = data.semester;
    } else if (data.role === 'instructor') {
      if (data.employeeId) user.employeeId = data.employeeId;
      if (data.department) user.department = data.department;
    }

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
}

export default new AuthService();
