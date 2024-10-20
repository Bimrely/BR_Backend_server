import mongoose, { Schema } from 'mongoose';


const filesSchema = new Schema({
  name: String,
  fileInfo: Object,
  fileBucket: String,
  fileKey: String,
  location: String,
  contentType: String,
  added: { type: Date, default: Date.now },
});


const commentSchema = new mongoose.Schema({

  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }] ,
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  learn: { type: mongoose.Schema.Types.ObjectId, ref: 'Learn' },
  job:{type:mongoose.Schema.Types.ObjectId,ref:'Job'},
  text: {type:String},
  file: filesSchema,
  commentAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
},
  createdAt: { type: Date, default: Date.now },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    
}

});

export const Comment = mongoose.model('Comment', commentSchema);

