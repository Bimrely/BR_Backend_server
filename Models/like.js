import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  learn: { type: mongoose.Schema.Types.ObjectId, ref: 'Learn' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  job:{type:mongoose.Schema.Types.ObjectId,ref:'Job'}, 
  createdAt: { type: Date, default: Date.now },







});
 










export const Like = mongoose.model('Like', likeSchema);
