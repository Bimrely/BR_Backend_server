
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

const ReplySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
    likes: { type: Number, default: 0 },
    // likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likedBy: [
        {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          firstName: String,
          lastName: String,
        },
      ],
    text: String,
    firstName: String,
    lastName: String,
    added: { type: Date, default: Date.now },
  //   replies: [{ 
  //     type: mongoose.Schema.Types.ObjectId, 
  //     ref: 'Reply' 
  // }],
    // replies: [{       
    //   text:String,
    // firstName: String,
    // lastName: String,}],

});


const Reply = mongoose.model('Reply', ReplySchema);

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
    file:filesSchema,
    replies: [ReplySchema],
    added: { type: Date, default: Date.now }
});

const ArticleSchema = new Schema({
  firstName:String,
  lastName:String,
    text: String,
    // file: filesSchema,
    file:{
      type: String, // Store the URL or file path of the profile picture
      default: '',

    },
    createdAt: { type: Date, default: Date.now },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'Profile'  // Reference the Profile model, not User
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
  
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

export const Article = mongoose.model('Article', ArticleSchema);


export const ReplyModel = Reply;


// import mongoose, { Schema } from 'mongoose';


// export const files = new Schema({
//     name: String,
//     fileInfo: Object,
//     fileBucket: String,
//     fileKey: String,
//     location: String,
//     contentType: String,
//     added: { type: Date, default: Date.now },
// });



// const ArticleSchema = new Schema({
//     text:String,
//     file:files,
     
//     likes: { type: Number, default: 0 },
//     shares: { type: Number, default: 0 },
    
//     comments: [
//       {
//         userId:{
//           type: mongoose.Schema.Types.ObjectId,
//           ref:"User",
          
//       },
//         text:String,
        
//       },
//     ],


//     userId:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref:"User",
        
//     }

// });


// export const Article = mongoose.model('Article', ArticleSchema);