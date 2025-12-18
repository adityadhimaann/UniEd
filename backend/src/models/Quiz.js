import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        if (this.type === 'multiple-choice') {
          return v && v.length >= 2;
        }
        return true;
      },
      message: 'Multiple choice questions must have at least 2 options',
    },
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String for MC/TF, Array for multiple correct
    required: function () {
      return this.type !== 'essay';
    },
  },
  points: {
    type: Number,
    required: true,
    min: [1, 'Points must be at least 1'],
  },
  explanation: {
    type: String,
    trim: true,
  },
});

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        answer: mongoose.Schema.Types.Mixed,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    isGraded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const quizSchema = new mongoose.Schema(
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
    instructions: {
      type: String,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'Quiz must have at least one question',
      },
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 60, // percentage
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number, // in minutes
      default: null,
    },
    attemptsAllowed: {
      type: Number,
      default: 1,
      min: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    availableUntil: {
      type: Date,
      required: true,
    },
    attempts: [attemptSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ course: 1, createdAt: -1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ 'attempts.student': 1 });

// Calculate total points before saving
quizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

// Ensure virtuals are included in JSON
quizSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
