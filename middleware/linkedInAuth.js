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
      accessToken:"AQUOkZ1AeQ0ynKwFRQecpz-2OxG8-J_H7OMZ4jinRvlsm7U6d6ifWabscLvPOqqHXvFPIir6u8qUA2BWqx_QXqNI0xXAbXWg9VDIt_ZGrwfmTDl7VgXkE-j-BCewVS7OMXGFWIFVbyQdw3DNSd3EZhkMUYrnm0oOcZKVpRQPXXxTaUDPvy28Sn-KXFSvqmaNyK1FwRlDIgPB9aR6kh2WvWG4Jp6I7hQIpAO9U85DvHaZIB7hB3KpbEdelgfAqO9lOsIrONNTBofLpd-To8LiagXOdeWnCOoPqKn_v35AljJ9DxfZAv-ydDEmXide83qTTZiW-oqFlh-l2v0mIMmLcuwv6YEgbg"
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
