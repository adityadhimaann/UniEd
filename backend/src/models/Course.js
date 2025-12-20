import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty is required'],
    },
    schedule: {
      days: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      time: {
        type: String,
        trim: true,
      },
      room: {
        type: String,
        trim: true,
      },
    },
    syllabus: {
      type: String,
      default: null,
    },
    maxStudents: {
      type: Number,
      default: 60,
      min: [1, 'Maximum students must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    titleImage: {
      type: String,
      default: null,
      trim: true,
    },
    videos: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        duration: {
          type: String,
          trim: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        isPublic: {
          type: Boolean,
          default: false,
        },
      },
    ],
    materials: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ['pdf', 'doc', 'ppt', 'link', 'other'],
          required: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        size: {
          type: String,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ department: 1, semester: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for enrollment count (populate separately)
courseSchema.virtual('enrollmentCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true,
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
