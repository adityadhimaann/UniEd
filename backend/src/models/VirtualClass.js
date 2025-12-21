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
    default: null,
  },
  role: {
    type: String,
    enum: ['host', 'co-host', 'participant'],
    default: 'participant',
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
  isVideoOff: {
    type: Boolean,
    default: false,
  },
  isHandRaised: {
    type: Boolean,
    default: false,
  },
});

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    text: String,
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const virtualClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    meetingLink: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    participants: [participantSchema],
    chatMessages: [chatMessageSchema],
    polls: [pollSchema],
    settings: {
      allowParticipantVideo: {
        type: Boolean,
        default: true,
      },
      allowParticipantAudio: {
        type: Boolean,
        default: true,
      },
      allowParticipantScreenShare: {
        type: Boolean,
        default: false,
      },
      allowParticipantChat: {
        type: Boolean,
        default: true,
      },
      enableWaitingRoom: {
        type: Boolean,
        default: false,
      },
      recordSession: {
        type: Boolean,
        default: false,
      },
      maxParticipants: {
        type: Number,
        default: 100,
      },
    },
    recordingUrl: {
      type: String,
      default: null,
    },
    whiteboard: {
      data: {
        type: String,
        default: null,
      },
      lastUpdated: {
        type: Date,
        default: null,
      },
    },
    sharedFiles: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
virtualClassSchema.index({ course: 1, scheduledStartTime: 1 });
virtualClassSchema.index({ host: 1 });
virtualClassSchema.index({ meetingLink: 1 });
virtualClassSchema.index({ status: 1 });

// Generate unique meeting link
virtualClassSchema.pre('save', function(next) {
  if (!this.meetingLink) {
    this.meetingLink = `${this.course}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

const VirtualClass = mongoose.model('VirtualClass', virtualClassSchema);

export default VirtualClass;
