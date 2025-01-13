import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: { type: String, lowercase: true ,},
    googleId: String,
    linkedinId:String,
    displayName: String,
    // position:String,
    // education:String,
    role: { type: String, default: 'user' },
    password: String,
   

   
    resetPasswordToken: {
        type: String,
        default: null,
      },
      resetPasswordTokenExpires: {
        type: Date,
        default: null,
      }, 
  

      accessToken: String, 




});


export const User = mongoose.model('User', UserSchema);