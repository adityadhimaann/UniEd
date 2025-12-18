import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'presentation', 'code', 'other'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.type !== 'link';
      },
    },
    externalLink: {
      type: String,
      required: function () {
        return this.type === 'link';
      },
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
    },
    category: {
      type: String,
      enum: ['lecture', 'reading', 'reference', 'supplementary', 'assignment', 'other'],
      default: 'lecture',
    },
    module: {
      type: String,
      trim: true,
    },
    week: {
      type: Number,
      min: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    accessLevel: {
      type: String,
      enum: ['all', 'enrolled', 'premium'],
      default: 'enrolled',
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseMaterialSchema.index({ course: 1, order: 1 });
courseMaterialSchema.index({ course: 1, module: 1 });
courseMaterialSchema.index({ uploadedBy: 1 });
courseMaterialSchema.index({ type: 1 });
courseMaterialSchema.index({ tags: 1 });

// Ensure virtuals are included in JSON
courseMaterialSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

export default CourseMaterial;
