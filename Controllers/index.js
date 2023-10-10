import { Router } from 'express';
import { Signup, resetPassword, setPassword } from '../Controllers/UserController.js';
import { SignIn } from '../Controllers/UserController.js';
import {createUserProfile,editUserProfile}from '../Controllers/UserController.js';
import {auth} from '../middleware/auth.js'

// import { googleauth } from '../middleware/googleAuth.js';
import passport from '../middleware/googleAuth.js';
const router = Router();



router.post('/register-user',Signup);
router.post('/login-user',SignIn);
router.post('/create-profile' ,auth,createUserProfile)
router.put('/edit-profile' ,auth,editUserProfile)
router.post('/forget-password', resetPassword)
router.put('/set-password/:token', setPassword)



// router.get('/login',passport.authenticate('google', { scope: ['profile', 'email']}));
// router.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/api/login/error' }),
//   (req, res) => {
//     // Successful authentication, redirect or respond with a success message
//     res.send('Authentication successful!');
//   })

export default router;