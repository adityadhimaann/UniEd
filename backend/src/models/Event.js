import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['lecture', 'deadline', 'meeting', 'office-hours', 'lab', 'exam', 'assignment', 'virtual-class', 'other'],
      required: [true, 'Event type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: String, // Format: "HH:MM AM/PM"
    },
    endTime: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isAllDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3b82f6', // Default blue color
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      minutesBefore: {
        type: Number,
        default: 30,
      },
    },
    recurrence: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      endDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ createdBy: 1 });
eventSchema.index({ course: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ participants: 1 });

// Virtual to check if event is past
eventSchema.virtual('isPast').get(function () {
  return this.startDate < new Date();
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
