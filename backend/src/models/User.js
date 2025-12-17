import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId && !this.microsoftId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    microsoftId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'microsoft'],
      default: 'local',
    },
    firstName: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'parent'],
      required: [true, 'Role is required'],
      default: 'student',
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    profile: {
      phone: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    academicInfo: {
      studentId: {
        type: String,
        sparse: true,
        unique: true,
      },
      employeeId: {
        type: String,
        sparse: true,
        unique: true,
      },
      department: {
        type: String,
      },
      semester: {
        type: Number,
        min: 1,
        max: 12,
      },
      batch: {
        type: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance (email already has unique: true)
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 3600000; // 1 hour
  
  return resetToken;
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return this.getFullName();
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
