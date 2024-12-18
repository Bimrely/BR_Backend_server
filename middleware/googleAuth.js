
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { User } from '../Models/userModel.js';
import { Profile } from '../Models/userprofile.js'; // Assuming you have a Profile model
import jwt from 'jsonwebtoken';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: '458657353939-5kvfbtstgk4ljltrp3uqra2u25bo791k.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://br-backend-server.vercel.app/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const userData = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        firstName: profile.name.givenName, // Extract first name from Google profile
        lastName: profile.name.familyName, // Extract last name from Google profile
        accessToken,
        refreshToken,
      };

      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, update profile
          await Profile.findOneAndUpdate(
            { userId: user._id },
            {
              firstName: userData.firstName,
              lastName: userData.lastName,
            },
            { new: true }
          );
          return done(null, user);
        } else {
          // If user doesn't exist, create a new user
          user = new User(userData);
          await user.save();

          // Create the user's profile with firstName and lastName
          const profileData = {
            userId: user._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
          };

          await new Profile(profileData).save();
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and deserialize users
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((error) => done(error));
});

export default passport;







// import passport from 'passport';
// import  GoogleStrategy from 'passport-google-oauth20';
// import {User} from '../Models/userModel.js';
// // import {googleid,googlesecret,callbackurl} from '../config.js'; 



  
//   passport.use(
//   new GoogleStrategy(
//     {
//       clientID: '458657353939-5kvfbtstgk4ljltrp3uqra2u25bo791k.apps.googleusercontent.com' ,
//       clientSecret:'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',
//       callbackURL: 'https://br-backend-server.vercel.app/auth/google/callback',
//     },
//     (accessToken, refreshToken, profile, done) => {
//       const userData = {
//         googleId: profile.id,
//         displayName: profile.displayName,
//         email: profile.emails[0].value,
//         accessToken,
//         refreshToken
//       };

//       // Check if the user already exists in the database
//       User.findOne({ googleId: profile.id })
//         .then((user) => {
//           if (user) {
//             done(null, user);
//           } else {
//             // Create a new user
//             new User(userData)
//               .save()
//               .then((newUser) => done(null, newUser))
//               .catch((error) => done(error));
//           }
//         })
//         .catch((error) => done(error));
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id)
//     .then((user) => done(null, user))
//     .catch((error) => done(error));
// });

// export default passport;
