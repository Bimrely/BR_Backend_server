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



const IssueSchema = new Schema({
    name:String,
    file:files,
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: [
      {
        userId:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"User",
          
      },
        text: String,
      },
    ],


     
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        
    }

});


export const Issue = mongoose.model('Issue', IssueSchema);