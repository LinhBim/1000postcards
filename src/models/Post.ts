import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    vibe: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'auto',
    },
    titleFont: {
      type: String,
      default: 'auto',
    },
    status: {
      type: String,
      default: 'published',
    },
    isPostcard: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
    },
    backImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
