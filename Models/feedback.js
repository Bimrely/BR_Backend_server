// models/Feedback.js

import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedbackText: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },  // Rating between 1-5
  createdAt: { type: Date, default: Date.now },
});

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
