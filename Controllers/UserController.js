import { User } from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SECRET_KEY = "SECRET";
import { Profile } from "../Models/userprofile.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer'




     
           // Sign Up Function Start //

export const Signup = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //checking user is already exits//

  const exitsUser = await User.findOne({ email: email });
  if (exitsUser) {
    return res.status(400).json({ message: "user is already exists" });
  }

  // genetare hashed password//
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // craete user //

  const user = await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
   

  });

  // generating token logic //

  const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY);

  res.status(200).json({
    success: true,
    user,
    token,
  });
};

// Sign Up Function End //





  
 // Sign In Function Start //

export const SignIn = async(req, res, next)=>{

  const {email,password} = req.body;
  
  // checking if user is not exist//
  
  const existUser = await User.findOne({email:email,});
  
  if(!existUser){
      return res.status(404).json({message:"user not found"});

  }

  // compare hashedPassword//

  const matchePassword = await bcrypt.compare(password,existUser.password);

   if(!matchePassword){

    return res.status(404).json({message:"invalid credentails"});
   }   

// genetaring token//

 const token = jwt.sign({email:existUser.email, id:existUser._id},SECRET_KEY);

 res.status(200).json({
  success: true,
  existUser,
  token,
});


}

// Sign In Function End //


// Create user profile // 


export const createUserProfile = async (req, res) => {
  try {
    const { userId, designation, company, location, experience, education } = req.body;

    let profile = await Profile.findOne({ userId }).select('experience education');

    if (!profile) {
      // Create a new profile if it doesn't exist
      profile = await Profile.create({
        userId:req.userId,
        profile: {
          designation,
          company,
          location,
          experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
          education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })),
          // experience,
          // education,
        },



      });
    } else {
      // Update the existing profile
      profile.profile.designation = designation;
      profile.profile.company = company;
      profile.profile.location = location;
      profile.profile.experience = experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) }));
      profile.profile.education = education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) }));   
      // profile.profile.experience = experience;
      // profile.profile.education = education;
      await profile.save();
    }

    res.status(200).json({ message: 'User profile created/updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating user profile', error });
  }
};


// Edit User Profile //

export const editUserProfile = async (req, res) => {
  try {
    const { userId, designation, company, location, experience, education } = req.body;

  
    const profile = await Profile.findOneAndUpdate({
      userId:req.userId,
      profile: {
        designation,
        company,
        location,
        experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
        education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })),
        // experience,
        // education,
      },
    }
      );

    // if (!profile) {
    //   return res.status(404).json({ message: 'User profile not found' });
    // }

    res.status(200).json({ message: 'User profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error });
  }
};



const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "bb5814413c0572",
    pass: "11264f00bc7694"
  }
});



export const resetPassword = async(req,res)=>{


  try {
    const { email } = req.body;

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's reset token and expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Send the reset token to the user's email
    const mailOptions = {
      from: 'your-email@example.com', // Your email address
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested a password reset for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `http://your-app-url/reset-password/${resetToken}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Password reset email sent:', info.response);
      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}
  

  


export const setPassword =  async(req,res)=>{


   try {
    const {newPassword } = req.body;
    const {token} = req.params

    // Find the user by reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

     // Hash the new password
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }



}