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






const ProfileSchema = new Schema ({



        firstName:String,
        lastName:String,
        designation: String,
        company: String,
        location: String,
        experience: [{
            title: String,
            // company: String,
            startDate: Date,
            endDate: Date
        }],
        education: [{
            title: String,
            // degree: String,
            // school: String,
            startDate: Date,
            endDate: Date
        }],

        sharedJobs: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job'
        }],


        sharedIssues: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Issue'
        }],

        
        sharedArticles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
          }],



          sharedLearns: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Learn'
          }],

         


        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
        }
      ,
    

      profilePicture: {
        type: String, // Store the URL or file path of the profile picture
        default: '', // You can set a default profile picture if you want
      },
    });

    export const Profile = mongoose.model('Profile', ProfileSchema);

