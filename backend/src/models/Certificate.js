import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    certificateUrl: {
      type: String, // URL to generated PDF
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
    metadata: {
      totalHours: Number,
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      skills: [String],
      achievements: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ issuedDate: -1 });

// Generate certificate number
certificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.certificateNumber = `UNIED-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Generate verification code
certificateSchema.pre('save', function (next) {
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  next();
});

// Ensure virtuals are included in JSON
certificateSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
