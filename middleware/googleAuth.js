import passport from 'passport';
import  GoogleStrategy from 'passport-google-oauth20';
import {User} from '../Models/userModel.js';
// import {googleid,googlesecret,callbackurl} from '../config.js'; 



  
  passport.use(
  new GoogleStrategy(
    {
      clientID: '458657353939-5kvfbtstgk4ljltrp3uqra2u25bo791k.apps.googleusercontent.com' ,
      clientSecret:'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',
      callbackURL: 'https://br-backend-server.vercel.app/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const userData = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        accessToken,
        refreshToken
      };

      // Check if the user already exists in the database
      User.findOne({ googleId: profile.id })
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
