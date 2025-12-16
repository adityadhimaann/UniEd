import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'mid', 'final'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const gradeSchema = new mongoose.Schema(
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
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
    },
    assessments: {
      type: [assessmentSchema],
      default: [],
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', null],
      default: null,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate grade records
gradeSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });
gradeSchema.index({ student: 1 });
gradeSchema.index({ course: 1 });

// Method to calculate grade and GPA
gradeSchema.methods.calculateGrade = function () {
  if (this.assessments.length === 0) return;

  let totalMarks = 0;
  let totalMaxMarks = 0;

  this.assessments.forEach((assessment) => {
    totalMarks += assessment.marks;
    totalMaxMarks += assessment.maxMarks;
  });

  this.totalMarks = totalMarks;
  this.percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

  // Calculate letter grade based on percentage
  if (this.percentage >= 90) {
    this.grade = 'A+';
    this.gpa = 4.0;
  } else if (this.percentage >= 85) {
    this.grade = 'A';
    this.gpa = 3.7;
  } else if (this.percentage >= 80) {
    this.grade = 'A-';
    this.gpa = 3.3;
  } else if (this.percentage >= 75) {
    this.grade = 'B+';
    this.gpa = 3.0;
  } else if (this.percentage >= 70) {
    this.grade = 'B';
    this.gpa = 2.7;
  } else if (this.percentage >= 65) {
    this.grade = 'B-';
    this.gpa = 2.3;
  } else if (this.percentage >= 60) {
    this.grade = 'C+';
    this.gpa = 2.0;
  } else if (this.percentage >= 55) {
    this.grade = 'C';
    this.gpa = 1.7;
  } else if (this.percentage >= 50) {
    this.grade = 'C-';
    this.gpa = 1.3;
  } else if (this.percentage >= 40) {
    this.grade = 'D';
    this.gpa = 1.0;
  } else {
    this.grade = 'F';
    this.gpa = 0.0;
  }
};

// Ensure virtuals are included in JSON
gradeSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
