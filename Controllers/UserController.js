import { User } from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SECRET_KEY = "SECRET";
import { Profile } from "../Models/userprofile.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import { Article } from "../Models/article.js";
import { Feedback } from "../Models/feedback.js";



     
           // Sign Up Function Start //

export const Signup = async (req, res, next) => {
  const { firstName, lastName, email, password,userId} = req.body;

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
 
  
  
   // Create user profile
   const newProfile = await Profile.create({
    userId:user._id,
    // userId:req.userId,
      
        firstName,
        lastName,
       
        // experience,
        // education,
      

    // Any other fields you want to include in the profile
  });





  // generating token logic //

  const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY);

  res.status(200).json({
    success: true,
    user,
    token,
    newProfile
  });
};

// Sign Up Function End //


// Logout api call//

export const logOut = async(req,res)=>{

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });



}


  
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






 // Function to get profile by user ID
// export const getProfileById = async (req, res) => {
//   try {
//     // Get the user ID from the request (e.g., req.params.userId)
//     const userId = req.params.userId;
//     console.log("Received user ID:", userId);

//     const profile = await Profile.findById(userId);
//     console.log("Found profile:", profile);

//     // Find profile by matching userId
 

//     // Check if profile found
//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }

//     // Profile found, send response
//     res.status(200).json(profile);

//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching profile', error });
//   }
// };



// Backend: getProfileByUserId
export const getProfileByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const userProfile = await Profile.findOne({ userId })
    .populate({
      path: 'sharedArticles',
      populate: { path: 'author', select: 'firstName lastName profilePicture' }
    })
    .populate({
      path: 'sharedIssues',
      populate: { path: 'author', select: 'firstName lastName profilePicture' }
    })
    .populate({
      path: 'sharedJobs',
      populate: { path: 'author', select: 'firstName lastName profilePicture' }
    })
    .populate({
      path: 'sharedLearns',
      populate: { path: 'author', select: 'firstName lastName profilePicture' }
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ userProfile });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Error retrieving user profile', error });
  }
};












export const getProfile = async (req, res) => {
  const userId = req.userId; // Assuming you're using authentication middleware and user ID is available in req.userId

  try {
    const userProfile = await Profile.findOne({ userId })
      .populate({
        path: 'sharedArticles',
        populate: { path: 'author', select: 'firstName lastName profilePicture' }
      })
      .populate({
        path: 'sharedIssues',
        populate: { path: 'author', select: 'firstName lastName profilePicture' }
      })
      .populate({
        path: 'sharedJobs',
        populate: { path: 'author', select: 'firstName lastName profilePicture' }
      })
      .populate({
        path: 'sharedLearns',
        populate: { path: 'author', select: 'firstName lastName profilePicture' }
      });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ userProfile });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Error retrieving user profile', error });
  }
};



// Fetch all profiles - API Endpoint
export const getAllProfiles = async (req, res) => {
  try {
    // Fetch only necessary fields for mention functionality
    const profiles = await Profile.find({}, 'firstName lastName profilePicture userId');
    res.status(200).json({ profiles });
  } catch (error) {
    console.error('Error retrieving profiles:', error);
    res.status(500).json({ message: 'Error retrieving profiles', error });
  }
};



  // Get user profile By Id//
//   export const getProfile = async (req, res) => {
//     const userId = req.userId; // Assuming you're using authentication middleware and user ID is available in req.user.id

//     try {
//         const userProfile = await Profile.findOne({ userId })  
//         .populate('sharedArticles')
//         .populate('sharedIssues')
//         .populate('sharedJobs')
//         .populate('sharedLearns')
       
//         if (!userProfile) {
//             return res.status(404).json({ message: 'Profile not found' });
//         }

//         res.status(200).json({ userProfile
//          });
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving user profile', error });
//     }
// };

  // export const getProfile = async(req,res)=>{

  // try {

  //  const getProfile = await Profile.find();

  //   res.status(200).json({

  //  getProfile,


  //   })
    
  // } catch (error) {
  //   res.status(500).json({ message: 'Error creating/get user profile', error });
  // }



  // }


// Create user profile // 


export const createUserProfile = async (req, res) => {
  try {
    const { userId, designation, company, location, experience, education ,firstName,lastName} = req.body;


const profile = new Profile({
  userId:req.userId,
  firstName:firstName,
  lastName:lastName,
  location:location,
  designation:designation,
  experience:experience,
  education:education,
  company:company

})

await profile.save();

    // let profile = await Profile.findOne({ userId }).select('experience education');

    // if (!profile) {
    //   // Create a new profile if it doesn't exist
    //  profile = await Profile.create({
      
    //     userId:req.userId,
    //       firstName,
    //       lastName,
    //       designation,
    //       company,
    //       location,
    //       experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
    //       education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })),
         
    //       // experience,
    //       // education,
        



    //   });
    // } else {
    //   // Update the existing profile
    //   profile.designation = designation;
    //   profile.company = company;
    //   profile.location = location;
    //   profile.experience = experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) }));
    //   profile.education = education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) }));   
    //   // profile.profile.experience = experience;
    //   // profile.profile.education = education;
    //   await profile.save();
    // }

    res.status(200).json({ message: 'User profile created/updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating user profile', error });
  }
};


// Edit User Profile //

// export const editUserProfile = async (req, res) => {
//   try {
//     const { userId, designation, company, location, experience, education,firstName,
//       lastName  } = req.body;

  
//     const profile = await Profile.findOneAndUpdate({
//       userId:req.userId,
//       profile: {
//         firstName,
//         lastName,
//         designation,
//         company,
//         location,
//         experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
//         education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })),
//         // experience,
//         // education,
//       },
//     }
//       );

//     // if (!profile) {
//     //   return res.status(404).json({ message: 'User profile not found' });
//     // }

//     res.status(200).json({ message: 'User profile updated', profile });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating user profile', error });
//   }
// };

export const editUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, designation, company, location, experience, education } = req.body;
    const { profileId } = req.params;
    const userId = req.userId;

 

    console.log(req.body);
    // Check if experience and education arrays exist, if not, assign empty arrays
    const updatedExperience = experience ? experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })) : [];
    const updatedEducation = education ? education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })) : [];

    const updatedProfile = await Profile.findByIdAndUpdate(profileId, {
      firstName,
      lastName,
      designation,
      company,
      location,
      experience: updatedExperience,
      education: updatedEducation
    }, { new: true });





    const updateUser = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
     
    }, { new: true });
    
    // await Article.updateMany({ userId }, { $set: { firstName, lastName, 'likedBy.$[elem].firstName': firstName, 'likedBy.$[elem].lastName': lastName } }, { arrayFilters: [{ "elem.userId": userId }] });
    // await Article.updateMany({ 'likedBy.userId': userId }, { $set: { 'likedBy.$.firstName': firstName, 'likedBy.$.lastName': lastName } });
    // await Article.updateMany({ userId }, { $set: { firstName, lastName } });
    // // await Article.updateMany({ 'comments.userId': userId }, { $set: { 'comments.$.firstName': firstName, 'comments.$.lastName': lastName } });
    // await Article.updateMany({ 'comments.userId': userId }, { $set: { 'comments.$.firstName': firstName, 'comments.$.lastName': lastName, 'comments.$.likedBy.$[elem].firstName': firstName, 'comments.$.likedBy.$[elem].lastName': lastName } }, { arrayFilters: [{ "elem.userId": userId }] });
    // await Article.updateMany({ 'comments.replies.userId': userId }, { $set: { 'comments.$[commentElem].replies.$[replyElem].firstName': firstName, 'comments.$[commentElem].replies.$[replyElem].lastName': lastName } }, { arrayFilters: [{ "commentElem.userId": userId }, { "replyElem.userId": userId }] });
    
    // await Article.updateMany(
    //   { 'comments.replies.userId': userId },
    //   {
    //     $set: {
    //       'comments.$[commentElem].replies.$[replyElem].likedBy.$[likedByElem].firstName': firstName,
    //       'comments.$[commentElem].replies.$[replyElem].likedBy.$[likedByElem].lastName': lastName
    //     }
    //   },
    //   { arrayFilters: [{ 'commentElem.replies.userId': userId }, { 'replyElem.userId': userId }, { 'likedByElem.userId': userId }] }
    // );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json({ message: 'User profile updated', userProfile: updatedProfile ,userUpdate:updateUser,});
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}


// export const editUserProfile = async (req, res) => {


//   try {
//     const { firstName, lastName, designation, company, location, experience, education } = req.body;
//     const { profileId } = req.params;

//     const updatedProfile = await Profile.findByIdAndUpdate(profileId, {
//       firstName,
//       lastName,
//       designation,
//       company,
//       location,
//       experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
//       education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) }))
//     }, { new: true });

//     if (!updatedProfile) {
//       return res.status(404).json({ message: 'User profile not found' });
//     }

//     res.status(200).json({ message: 'User profile updated', profile: updatedProfile });
//   } catch (error) {
//     console.error('Error updating user profile:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
//   // try {
//   //   const { userId, designation, company, location, experience, education,firstName,lastName } = req.body;
//   //   console.log(req.body);
//   //   const {profileId} = req.params
  
//   //   const profile = await Profile.findByIdAndUpdate(profileId,{
    
      
      
      
//   //       firstName,
//   //       lastName,
//   //       designation,
//   //       company,
//   //       location,
//   //       experience: experience.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: new Date(exp.endDate) })),
//   //       education: education.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })),
        
//   //       // experience,
//   //       // education,
      
//   //   },{ new: true }

//   //     );

//   //   // if (!profile) {
//   //   //   return res.status(404).json({ message: 'User profile not found' });
//   //   // }
//   //   console.log(profile)

//   //   res.status(200).json({ message: 'User profile updated', profile });
//   // } catch (error) {
//   //   res.status(500).json({ message: 'Error updating user profile', error });
//   // }
// };



const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 465,  // Use port 465 for SSL
  secure: true, // Use SSL/TLS for this connection
  auth: {
    user: "28dd11685e37e7",
    pass: "e501c0cc633f3f"
  }
});


export const submitFeedback = async (req, res) => {
  try {
    const { feedbackText, rating } = req.body;
    const userId = req.userId;  // Retrieved from auth middleware

    // Save feedback to the database
    const feedback = new Feedback({ userId, feedbackText, rating });
    await feedback.save();

    // Set up the email data
    const mailOptions = {
      from:"",
      to: "rafay.burraq@gmail.com", // The email address you want to receive feedback notifications at
      subject: 'New User Feedback Received',
      text: `New feedback received from user ID: ${userId}\n\nFeedback: ${feedbackText}\nRating: ${rating}/5`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'An error occurred while submitting feedback.' });
  }
};




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