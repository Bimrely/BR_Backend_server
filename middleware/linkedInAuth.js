import passport from 'passport';
// import  LinkedInStrategy  from 'passport-linkedin-oauth2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import {User} from '../Models/userModel.js';
// import axios from 'axios';


 




  passport.use(
  new LinkedInStrategy(
    {
      clientID: '786qjd4hbvjdov' ,
      clientSecret:'WPL_AP1.yn3cBc7FHReVqXtj.dYTxcA==',
      callbackURL: 'http://localhost:5000/auth/linkedin/callback',
      scope: ['openid','email', 'profile'],
      state: true,
      accessToken: 'AQU9x7K1QT4HhWtEil2947-gfzDLni36VEhxbGdHSI-q-bUPZSKM7drbxdFhdXQ7WbR8doQlDnkh7FHLjqahKcOfAab9NblOhKmfYAEJr1WfBUBQFVKwJvr7Dcn_lJEgeDQxWpC2HeR2SAIdS60sLkE3-PdmCB6pXfG9i3wZ9s614nkbDa6n3WS-cH0jFDD0xhqH8P8yw_b_VLoEMiAq8SWnjrkCkDk1PrMcB4xxHsmqg3udw5HS9O5cwOAZa-HIbLBGjzFA3TRen1DRYKEuSQjTtM029NlWBJZWabfmCz5APuO8RQXb5x-ZTNmWkoKEZybkVsu6DM1UFf8fS8njVX-Te9yBUA'
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
