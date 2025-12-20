import mongoose from 'mongoose';

const contentProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    videosWatched: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
        completed: {
          type: Boolean,
          default: true,
        },
      },
    ],
    materialsViewed: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalVideos: {
      type: Number,
      default: 0,
    },
    totalMaterials: {
      type: Number,
      default: 0,
    },
    videosProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    materialsProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overallContentProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contentProgressSchema.index({ student: 1, course: 1 }, { unique: true });
contentProgressSchema.index({ course: 1 });
contentProgressSchema.index({ student: 1 });

// Method to calculate progress
contentProgressSchema.methods.calculateProgress = function () {
  // Calculate videos progress
  if (this.totalVideos > 0) {
    this.videosProgress = Math.round((this.videosWatched.length / this.totalVideos) * 100);
  } else {
    this.videosProgress = 0;
  }

  // Calculate materials progress
  if (this.totalMaterials > 0) {
    this.materialsProgress = Math.round((this.materialsViewed.length / this.totalMaterials) * 100);
  } else {
    this.materialsProgress = 0;
  }

  // Calculate overall content progress (average of videos and materials)
  const totalItems = this.totalVideos + this.totalMaterials;
  if (totalItems > 0) {
    const completedItems = this.videosWatched.length + this.materialsViewed.length;
    this.overallContentProgress = Math.round((completedItems / totalItems) * 100);
  } else {
    this.overallContentProgress = 0;
  }

  return this.overallContentProgress;
};

// Ensure virtuals are included in JSON
contentProgressSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const ContentProgress = mongoose.model('ContentProgress', contentProgressSchema);

export default ContentProgress;
