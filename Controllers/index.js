import { Router } from 'express';
import { Signup, resetPassword, setPassword, submitFeedback } from '../Controllers/UserController.js';
import { SignIn } from '../Controllers/UserController.js';
import {createUserProfile,editUserProfile,logOut,getProfile, getAllProfiles,getProfileByUserId}from '../Controllers/UserController.js';
import {auth} from '../middleware/auth.js'

// import { googleauth } from '../middleware/googleAuth.js';
import passport from '../middleware/googleAuth.js';
const router = Router();


router.post('/logout-user',logOut);
router.post('/register-user',Signup);
router.post('/login-user',SignIn);


// routes/profile.js
router.get('/all-profiles', auth, getAllProfiles);

router.get('/profile',auth,getProfile)
// In your routes file
router.get('/profile/:userId',auth, getProfileByUserId);


// router.get('/profile/:userId',auth,getProfileById)
router.post('/create-profile',auth,createUserProfile)
router.put('/edit-profile/:profileId',auth,editUserProfile)




router.post('/forget-password', auth,resetPassword)
router.put('/set-password/:token',auth, setPassword)



router.post('/submit-feedback', auth,submitFeedback)
// router.get('/login',passport.authenticate('google', { scope: ['profile', 'email']}));
// router.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/api/login/error' }),
//   (req, res) => {
//     // Successful authentication, redirect or respond with a success message
//     res.send('Authentication successful!');
//   })

export default router;