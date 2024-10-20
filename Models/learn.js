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
    ref: "Profile"  // Reference to the Profile model, not User
  },
  text: String,
  // firstName: String,
  // lastName: String,
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







const LearnSchema = new Schema({
    text:String,
    firstName:String,
    lastName:String,

    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: [CommentSchema],
    file:{
      type: String, // Store the URL or file path of the profile picture
      default: '',

    },
    createdAt: { type: Date, default: Date.now },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'Profile'  // Reference the Profile model, not User
    },
    videoId:String,
    title:String,
   
 
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


export const Learn = mongoose.model('Learn', LearnSchema);