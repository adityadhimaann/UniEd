import mongoose from 'mongoose';

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
  },
  moduleName: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0,
  },
  materials: [
    {
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseMaterial',
      },
      viewed: {
        type: Boolean,
        default: false,
      },
      viewedAt: {
        type: Date,
      },
      progress: {
        type: Number, // percentage
        default: 0,
        min: 0,
        max: 100,
      },
    },
  ],
});

const progressSchema = new mongoose.Schema(
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
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    modules: [moduleProgressSchema],
    assignments: {
      total: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      averageGrade: {
        type: Number,
        default: 0,
      },
    },
    quizzes: {
      total: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
    attendance: {
      total: {
        type: Number,
        default: 0,
      },
      present: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    timeSpent: {
      type: Number, // total minutes spent in course
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
progressSchema.index({ student: 1, course: 1 }, { unique: true });
progressSchema.index({ course: 1 });
progressSchema.index({ student: 1 });
progressSchema.index({ overallProgress: 1 });

// Method to calculate overall progress
progressSchema.methods.calculateProgress = function () {
  let totalProgress = 0;
  let count = 0;

  // Module progress
  if (this.modules.length > 0) {
    const moduleProgress = this.modules.reduce((sum, m) => sum + (m.completed ? 100 : 0), 0) / this.modules.length;
    totalProgress += moduleProgress;
    count++;
  }

  // Assignment progress
  if (this.assignments.total > 0) {
    const assignmentProgress = (this.assignments.completed / this.assignments.total) * 100;
    totalProgress += assignmentProgress;
    count++;
  }

  // Quiz progress
  if (this.quizzes.total > 0) {
    const quizProgress = (this.quizzes.completed / this.quizzes.total) * 100;
    totalProgress += quizProgress;
    count++;
  }

  this.overallProgress = count > 0 ? Math.round(totalProgress / count) : 0;

  // Check if course is completed
  if (this.overallProgress >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }

  return this.overallProgress;
};

// Ensure virtuals are included in JSON
progressSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
