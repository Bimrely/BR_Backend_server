import mongoose, { Schema } from 'mongoose';


export const files = new Schema({
    name: String,
    fileInfo: Object,
    fileBucket: String,
    fileKey: String,
    location: String,
    contentType: String,
    added: { type: Date, default: Date.now },
});




const CommentSchema = new Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
  },
  text: String,
  firstName: String,
  lastName: String,
  likes: { type: Number, default: 0 },
  // likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  likedBy: [
      {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        firstName: String,
        lastName: String,
      },
    ],

  added: { type: Date, default: Date.now }
});





const IssueSchema = new Schema({
  firstName:String,
  lastName:String,
    text:String,
    file:files,
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: [CommentSchema],


    likedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        firstName: String,
        lastName: String,
      },
    ],
     
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        
    }

});


export const Issue = mongoose.model('Issue', IssueSchema);