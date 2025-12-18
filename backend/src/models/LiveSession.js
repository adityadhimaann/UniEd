import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  leftAt: {
    type: Date,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  isPresent: {
    type: Boolean,
    default: true,
  },
});

const liveSessionSchema = new mongoose.Schema(
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
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    scheduledStart: {
      type: Date,
      required: [true, 'Scheduled start time is required'],
    },
    scheduledEnd: {
      type: Date,
      required: [true, 'Scheduled end time is required'],
    },
    actualStart: {
      type: Date,
    },
    actualEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    meetingId: {
      type: String,
      trim: true,
    },
    meetingPassword: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['zoom', 'google-meet', 'microsoft-teams', 'custom', 'other'],
      default: 'zoom',
    },
    recordingUrl: {
      type: String,
    },
    isRecorded: {
      type: Boolean,
      default: false,
    },
    participants: [participantSchema],
    maxParticipants: {
      type: Number,
      default: 100,
    },
    agenda: {
      type: String,
      trim: true,
    },
    materials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseMaterial',
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    reminders: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
liveSessionSchema.index({ course: 1, scheduledStart: -1 });
liveSessionSchema.index({ instructor: 1 });
liveSessionSchema.index({ status: 1, scheduledStart: 1 });
liveSessionSchema.index({ 'participants.user': 1 });

// Virtual for participant count
liveSessionSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

// Virtual for duration
liveSessionSchema.virtual('duration').get(function () {
  if (this.actualStart && this.actualEnd) {
    return Math.round((this.actualEnd - this.actualStart) / (1000 * 60)); // in minutes
  }
  return 0;
});

// Ensure virtuals are included in JSON
liveSessionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);

export default LiveSession;
