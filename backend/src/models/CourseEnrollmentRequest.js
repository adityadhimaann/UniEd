import mongoose from 'mongoose';

const courseEnrollmentRequestSchema = new mongoose.Schema(
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
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    enrollmentType: {
      type: String,
      enum: ['free-trial', 'purchase', 'subscription'],
      required: [true, 'Enrollment type is required'],
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseEnrollmentRequestSchema.index({ student: 1, course: 1 });
courseEnrollmentRequestSchema.index({ course: 1, status: 1 });
courseEnrollmentRequestSchema.index({ instructor: 1, status: 1 });
courseEnrollmentRequestSchema.index({ createdAt: -1 });

// Prevent duplicate pending requests
courseEnrollmentRequestSchema.index(
  { student: 1, course: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

const CourseEnrollmentRequest = mongoose.model('CourseEnrollmentRequest', courseEnrollmentRequestSchema);

export default CourseEnrollmentRequest;
