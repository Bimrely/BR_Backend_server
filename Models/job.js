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








const JobSchema = new Schema({
  firstName:String,
  lastName:String,
    text:String,
    file:{
      type: String, // Store the URL or file path of the profile picture
      default: '',

    },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: [CommentSchema],

    profilePicture: {
      type: String, // Store the URL or file path of the profile picture
      default: '', // You can set a default profile picture if you want
    },
    
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


export const Job = mongoose.model('Job', JobSchema);