import mongoose from 'mongoose';





const ShareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  learn: { type: mongoose.Schema.Types.ObjectId, ref: 'Learn' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  job:{type:mongoose.Schema.Types.ObjectId,ref:'Job'},
  createdAt: { type: Date, default: Date.now },


});

export const Share = mongoose.model('Share', ShareSchema);
