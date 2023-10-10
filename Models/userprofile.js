import mongoose, { Schema } from 'mongoose';

const ProfileSchema = new Schema ({


    profile: {
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
        }]
    }
      ,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        
    }



    });

    export const Profile = mongoose.model('Profile', ProfileSchema);

