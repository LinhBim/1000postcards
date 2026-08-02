import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: 'Anonymous',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
