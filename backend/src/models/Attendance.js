import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance for same course and date
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ course: 1 });
attendanceSchema.index({ 'records.student': 1 });

// Ensure virtuals are included in JSON
attendanceSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
