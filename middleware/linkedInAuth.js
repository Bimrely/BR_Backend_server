import passport from 'passport';
// import  LinkedInStrategy  from 'passport-linkedin-oauth2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import {User} from '../Models/userModel.js';
// import axios from 'axios';


 




  passport.use(
  new LinkedInStrategy(
    {
      clientID: '78s3dg5r42x8ul' ,
      clientSecret:'1ipi2vqDIqVsvkv1',
      callbackURL: 'http://localhost:7000/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true,
      accessToken:"AQWYwEtFa-3GfSpque1KKQOib7tlTevdvkhqLV3_50COr2GUMZT2T_418FxOQ2q_6Pb1axqvZo1lDmhv9bZTkAdK-gSnkWV96RzyWzV5RCM4-SkFxWq4VY9SXKTaHna9Mhp_7A-4Feoovm58-FLgblNsaoubjVTCby0d5ooPUyYe8Iwi0rVhTJYWdQxRhsdZ9mr3i5ETpW0z_PHRjhfNnhgDP0yNln1ZS9TaxoLKRDnZcaqaCrxch2XJNryEN1GD2AyJoAiQYc2xSmYq-gEyXoCw7PgbNcjLZD3rkqRHjKZhhHVXLCW_3COt9KBwSWA6ZRJ85dk5Cyc3QXjmKuRopl7f-oiGfw"
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
