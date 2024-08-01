
// import mongoose from "mongoose";


// // Mongoose schema for Reply
// const replySchema = new mongoose.Schema({
//     text: { type: String, required: true },
//     comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
     
//     likes: { type: Number, default: 0 },
//     // likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//     likedBy: [
//         {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//           firstName: String,
//           lastName: String,
//         },
//       ],
//     text: String,
//     firstName: String,
//     lastName: String,
//     added: { type: Date, default: Date.now },
//   //   replies: [{ 
//   //     type: mongoose.Schema.Types.ObjectId, 
//   //     ref: 'Reply' 
//   // }],
//     replies: [{       
//       text:String,
//     firstName: String,
//     lastName: String,}],
//     // Add other fields like user ID, timestamp, etc. if needed
//   });
  
//   export const Reply = mongoose.model('Reply', replySchema);
  
 