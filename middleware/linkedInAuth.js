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
         scope: ['openid', 'email', 'profile'],
      state: true,
      accessToken:"AQRgwcSdHwWNpBv4-YQpp2eX190Yc0AVLm8-QgXY7ivTYITf4O5khUm9DaOb1LwTagkW9P-CKbu19bxZowdnwsSUEAWVOJG9qlsAvhLN7DAO8FMDzqapUU3upaisBIezIbEgK6BJyggraTcANkAlW_nCdh4dGEBUmAvwT5LtwwjnRT0-GIYkQLJOyLb_zpqUNtQhZ_SfeKAJSnBAtWM&state=XGECyaSbE3HI4jFq4ytGm7r3"
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
