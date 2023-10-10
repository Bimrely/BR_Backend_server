import passport from 'passport';
// import  LinkedInStrategy  from 'passport-linkedin-oauth2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import {User} from '../Models/userModel.js';
// import axios from 'axios';


 




  passport.use(
  new LinkedInStrategy(
    {
      clientID: '77u29m678yblq7' ,
      clientSecret:'5kDrj41aBDeixK10',
      callbackURL: 'http://localhost:7000/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true,
      accessToken:"AQVqlJkGSCEdRSxY4j4o1D-OqWSJ9vU3W1YSEbT_0ebSksBrYcTDfU6wl7tAb8Rn9snZSExNmQWabE32EeQH65_4J26rH-IaCimC-Pi_zoENxkBJRxLrVl2g4aWwNXjMTLE4lO6Jseyb8Z6Ti49iSf_sWtczGmzUx_UWbU6OEaJMFfIc3WOAdR7636YusdsbziZJ1vGFdfysizLHefToycbN9gVQc_2dAHe-xxubrYPYrmnt4QRR3G0prl1urcTOu9LRMBMfYLlNhD6kiL9YRdOMjWXnGc-lu8zf-ANSGLD0IUIf-r3jXFDHPjTRXIt2Zn9QWHpXbVV9ReoeHusDL7E1puBZ9A"
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
