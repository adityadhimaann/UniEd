import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'question', 'announcement', 'resource', 'discussion'],
      default: 'general',
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ isPinned: -1, createdAt: -1 });
discussionSchema.index({ tags: 1 });

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function () {
  return this.replies.length;
});

// Ensure virtuals are included in JSON
discussionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
