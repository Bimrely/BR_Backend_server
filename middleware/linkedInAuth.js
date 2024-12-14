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
      callbackURL: 'https://bimrelyfrontend.vercel.app/auth/linkedin/callback',
      scope: ['openid', 'email', 'profile'],
      state: true,
      accessToken:"AQXnPOAyc8Qoeg1uXOosaOX3oDp-dzzzZ8m6B_G7IxiYaopB-S5-ZQvZD1I_lNv5rpkqzSOiIZZW0coPduHnzPc-stFoG_u7as36jEmJT3KcjdH2sFp_FxKJVC-F47KmSdZ08wmUKANKjZFJcbp4mekOqjpAaTj7d0hEL5i95lk93qvek6-6IBWUJluRdrEJ5TrLXjPiPWS44YMtFaFFcUfg-pn0t78Fkpowxdaefrm3uq8cv4lqwEbfFTg8EzxsWNv9ncEI-DytZXlsC2FJYjTnOdtzoAb6kaMlXElhLiLteyVunUdFlOaR_4fiDXNa2yyXdcVSDb5_m9tnQ5tVZyxa1AdVAQ"
    },



   async (accessToken, refreshToken, profile, done) => {
     
console.log(accessToken,profile)
    
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
