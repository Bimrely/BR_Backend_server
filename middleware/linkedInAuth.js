import passport from 'passport';
// import  LinkedInStrategy  from 'passport-linkedin-oauth2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import {User} from '../Models/userModel.js';
// import axios from 'axios';


 




  passport.use(
  new LinkedInStrategy(
    {
      clientID: '782061rri2cvea' ,
      clientSecret:'WPL_AP1.x4Sjhfi8HiHMTjAk.RoyQYg==',
      callbackURL: 'https://br-backend-server.vercel.app/auth/linkedin/callback',
      scope: ['openid'],
      state: true,
      accessToken:"AQVCYhbSrY1kmDAoJtnsLu0x8ASVLJLk3gOd3UxocOC3e2xX4IlM8s5gmQlbVCKFO77pXGJY69VTlqKUQE-4bT_xocgKgKBO0Z-tu7Ep7_RSyG2qkMWYD_p4VR2CZAGl_U5i5B4luLw3Yge8h042OObNfA7lWI4ahPf81qzqiqeoRbjvkU43KNalX1lPC5UzRoBo80nv3qZP1UQmiTNbzLOt1b_hbrkhseSruTHVyfy2KyKnlAMO1THiuFQLjr-R0qEhf5Hl_knaPUGhPNaBCKscCjx5yE6y3SrY2hQBOLtHSBSN5Pr9kXwkvMmmLqIi_sb8_RwVGwYmQ0Gg2NdIb7zXnv31mw"
    },



   async (accessToken, refreshToken, profile, done) => {
     

    
// axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

// axios.get('https://api.linkedin.com/v2/me',{
// headers:{
//   'Authorization':`Bearer ${accessToken}`,
//   'cache-control':'no-cache',
//   'X-Restli-Protocol-Version':'2.0.0',

// },
// params:{
//  'projections':'(id,firstName,lastName,email,positions,educations)',

// },


// }

// )
//   .then(response => {
//     const userProfile = response.data;
//     console.log(userProfile);
//   })
//   .catch(error => {
//     console.error('Error retrieving LinkedIn profile:', error.response.data);
//   });


      
      const userData = {
        linkedinId: profile.id,
        displayName: profile.displayName,
        position: profile.position,
        education:profile.education,
        email: profile.emails[0].value,
        accessToken,
        refreshToken
      };

      // Check if the user already exists in the database
      User.findOne({ linkedinId: profile.id })
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            // Create a new user
            new User(userData)
              .save()
              .then((newUser) => done(null, newUser))
              .catch((error) => done(error));
          }
        })
        .catch((error) => done(error));
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((error) => done(error));
});

export default passport;
