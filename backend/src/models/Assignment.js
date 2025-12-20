import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  submissionText: {
    type: String,
    default: '',
  },
  files: {
    type: [String],
    default: [],
  },
  grade: {
    type: Number,
    min: [0, 'Grade cannot be negative'],
    default: null,
    validate: {
      validator: function(value) {
        // Allow null or undefined
        if (value === null || value === undefined) return true;
        // Must be a number >= 0
        return typeof value === 'number' && value >= 0;
      },
      message: 'Grade must be a positive number or null'
    }
  },
  feedback: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late', 'approved', 'disapproved'],
    default: 'submitted',
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'viewed', 'approved', 'disapproved'],
    default: 'pending',
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: false,
  },
}, { _id: false });

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    attachments: {
      type: [String],
      default: [],
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Ensure virtuals are included in JSON
assignmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
