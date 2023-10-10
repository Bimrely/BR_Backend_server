import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  learn: { type: mongoose.Schema.Types.ObjectId, ref: 'Learn' },
  job:{type:mongoose.Schema.Types.ObjectId,ref:'Job'},
  text: {type:String},
  createdAt: { type: Date, default: Date.now },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    
}

});

export const Comment = mongoose.model('Comment', commentSchema);

