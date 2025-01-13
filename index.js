import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { connectDB } from './db.js';
import routesForApp from './Routes.js';
// import http from 'http';
// import { Server } from 'socket.io';
// import passport from './middleware/linkedInAuth.js';
import passport from './middleware/googleAuth.js';
import { User } from './Models/userModel.js';
import { Profile } from './Models/userprofile.js';
import session from 'express-session';
import jwt from "jsonwebtoken"
import axios from 'axios';


const SECRET_KEY = "SECRET";
const app = express();

function isLoggedIn(req,res,next){
  console.log('rest')
  !req.user ? next(): res.sendStatus(401);
  
  }

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "https://frontend-jh2ijters-bimrelys-projects.vercel.app/", //
//     methods: ["GET", "POST","PUT"]
//   }
// });

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.json());


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));


//initializa passport and use it to manage sessions
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Welcome to Node Babel');
  console.log("running");
});


app.get('/auth/linkedin', (req, res) => {
  const clientID = '78qshjn1nikmuh';
  const redirectUri = 'https://br-backend-server.vercel.app/auth/linkedin/callback';
  const scope = 'openid email profile'; // OpenID and basic profile scopes
  const state = Math.random().toString(36).substring(7); // CSRF protection

  req.session.state = state;  // Store the state in session
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  
  res.redirect(authUrl);
});

// Handle the LinkedIn callback and exchange the code for tokens
app.get('/auth/linkedin/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  // Validate state
  if (!state || state !== req.session.state) {
    return res.status(400).send('State parameter mismatch.');
  }

  const clientID = '78qshjn1nikmuh';
  const clientSecret = 'WPL_AP1.gAjYts2NQxomv5ev.Nle8Vw==';
  const redirectUri = 'https://br-backend-server.vercel.app/auth/linkedin/callback';

  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientID,
    client_secret: clientSecret
  });

  try {
    const response = await axios.post(tokenUrl, tokenParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = response.data.access_token;
    const profile = await getLinkedInUserProfile(accessToken);
    const user = await saveUserProfile(profile, accessToken);

  // Generate JWT Token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: '1h' }
  );

  // Redirect to frontend with token
  res.redirect(
    `https://bimrelyfrontend.vercel.app/auth/linkedin/callback?token=${token}&user=${user._id}`
  );
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Error during authentication');
  }
});

// Fetch the user's LinkedIn profile
async function getLinkedInUserProfile(accessToken) {
  const profileUrl = 'https://api.linkedin.com/v2/userinfo';
  try {
    const response = await axios.get(profileUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

async function saveUserProfile(profile, accessToken) {
  console.log("Profile data:", profile);

  const userData = {
    linkedinId: profile.sub, // Use 'sub' instead of 'id'
    displayName: profile.name,
    email: profile.email,
    firstName: profile.given_name,
    lastName: profile.family_name,
    accessToken,
  };

  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ linkedinId: profile.sub }); // Query using 'sub'

    if (user) {
      // If user exists, update their profile information
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.displayName = userData.displayName;
      user.email = userData.email;
      user.accessToken = userData.accessToken;

      const updatedUser = await user.save();
      console.log("User updated:", updatedUser);

      // Update the associated profile if it exists
      await Profile.findOneAndUpdate(
        { userId: updatedUser._id },
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        { new: true, upsert: true } // Create if it doesn't exist
      );

      console.log("Profile updated for user:", updatedUser._id);
      return updatedUser;
    } else {
      // If user doesn't exist, create a new user
      const newUser = new User(userData);
      const savedUser = await newUser.save();
      console.log("New user saved:", savedUser);

      // Create an associated profile for the new user
      const profileData = {
        userId: savedUser._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      const newProfile = await new Profile(profileData).save();
      console.log("Profile created for new user:", savedUser._id);

      return savedUser;
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

// async function saveUserProfile(profile, accessToken) {
//   try {
//     let user = await User.findOne({ linkedinId: profile.id });

//     if (!user) {
//       user = new User({
//         linkedinId: profile.id,
//         firstName: profile.given_name,
//         lastName: profile.family_name,
//         email: profile.email,  // Assuming email is in the profile
//         accessToken
//       });
//       console.log(firstName)
//       await user.save();
//     }

//     return user;
//   } catch (error) {
//     console.error('Error saving user profile:', error);
//     throw error;
//   }
// }





// Replace with your LinkedIn credentials
// const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '786qjd4hbvjdov';
// const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.yn3cBc7FHReVqXtj.dYTxcA==';
// const REDIRECT_URI = 'http://localhost:7000/auth/linkedin/callback';
// const code = 'AQXfLWExRkAJ3bJDsMHZrA6qmJS039cQ08h4d8bYmjnWoTbnDxTqmn5OMg5Jfq2ElZHoa02Qf9I7cJjxS94iOgWZljCFS1jvZ_T9-dyqySHvnZa-oaZDAqJyqrSFBEh2SZ394BMyzVCBTZBiIklTVMm0CSmmGjqpst9Mh2nRQh_WY_6_zHgPecFpE9O0Ij545-xuCaMHNKPwrtuCPpD9E2zF0PPfmdPYx2X3WbrNx3tItshVB3aiBI9qQLZ1h0uD8wkcxuwzEDoXNw22zazQrIyrFHlz-SQac7R5o-OWGw0g75XbN3m61SbEHHjlVkZWpP9POxf9C5rm1HkO9N_OFMp6EIVbjw'
// // Step 1: Redirect to LinkedIn Authorization URL
// app.get('/api/login', (req, res) => {
//   const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=${code}&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
//     REDIRECT_URI
//   )}&scope=profie%20email%20openid`;
//   res.redirect(linkedInAuthUrl);
// });

// // Step 2: Handle Callback and Exchange Authorization Code for Access Token
// app.get('/auth/linkedin/callback', async (req, res) => {
//   const { code } = req.query;
//   console.log(code)

//   if (!code) {
//     return res.status(400).json({ error: 'Authorization code not provided.' });
//   }

//   try {
//     // Exchange authorization code for access token
//     const tokenResponse = await axios.post(
//       'https://www.linkedin.com/oauth/v2/accessToken',
//       new URLSearchParams({
//         grant_type: 'authorization_code',
//         code,
//         redirect_uri: REDIRECT_URI,
//         client_id: LINKEDIN_CLIENT_ID,
//         client_secret: LINKEDIN_CLIENT_SECRET,
//       }).toString(),
//       {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       }
//     );

//     const { access_token, id_token } = tokenResponse.data;

//     // Decode the ID token to verify the user's identity
//     const decodedToken = jwt.decode(id_token);
//     const { sub: linkedinId, email, name } = decodedToken;

//     // Fetch additional user data from LinkedIn if needed
//     const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     const userProfile = profileResponse.data;
//     const userEmail = emailResponse.data.elements[0]['handle~'].emailAddress;

//     // Create or find the user in your database
//     const user = await User.findOneAndUpdate(
//       { linkedinId },
//       { linkedinId, name: userProfile.localizedFirstName, email: userEmail },
//       { upsert: true, new: true }
//     );

//     // Generate a JWT for your application
//     const appToken = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

//     // Redirect to your frontend with the app token
//     res.redirect(`http://localhost:7000/auth/linkedin/callback?token=${appToken}&user=${user._id}`);
//   } catch (error) {
//     console.error('LinkedIn Authentication Error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to authenticate with LinkedIn.' });
//   }
// });












// Login route for linkedin //
// app.get('/api/login', passport.authenticate('linkedin', { scope:  ['email','profile'] }));
// Check if this route works as expected
// app.get('/api/login', passport.authenticate('linkedin', { scope: ['r_liteprofile', 'r_emailaddress'] }));

// app.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { failureRedirect: 'https://bimrelyfrontend.vercel.app/login' }), // Redirect to frontend login page
//   async (req, res) => {
//     try {
//       const user = req.user; // User authenticated via LinkedIn
//       const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
//         expiresIn: '1h',
//       });

//       // Redirect to your frontend with token and user info
//       res.redirect(
//         `https://bimrelyfrontend.vercel.app/auth/linkedin/callback?token=${token}&user=${user._id}`
//       );
//     } catch (error) {
//       console.error('LinkedIn callback error:', error);
//       // Fallback redirect to login on the frontend
//       res.redirect('https://bimrelyfrontend.vercel.app/login');
//     }
//   }
// );


// app.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { failureRedirect: '/login' }),
//   async (req, res) => {
//     try {
//       const user = req.user; // Fetched user from passport strategy
//       const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
//         expiresIn: '1h',
//       });

//       // Redirect to frontend with token and user details in query params
//       res.redirect(
//         `https://bimrelyfrontend.vercel.app/auth/linkedin/callback?token=${token}&user=${user._id}`
//       );
//     } catch (error) {
//       console.error('LinkedIn callback error:', error);
//       res.redirect('/login');
//     }
//   }
// );





// app.get('/api/login',
//   passport.authenticate('linkedin', { state: 'SOME STATE'  }),
//   function(req, res){
//     // The request will be redirected to LinkedIn for authentication, so this
//     // function will not be called.
//   });

// app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
//   successRedirect: '/protected',
//   failureRedirect: '/login'
// }));


// app.get('/api/linkedin/login', passport.authenticate('linkedin', { state: true }));

// app.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { failureRedirect: 'https://bimrelyfrontend.vercel.app/login' }),
//   async (req, res) => {
//     try {
//       const user = req.user; // The user object from LinkedIn strategy
//       const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
//         expiresIn: '1h',
//       });

//       // Redirect to your frontend with token
//       res.redirect(
//         `https://bimrelyfrontend.vercel.app/auth/linkedin/callback?token=${token}&user=${user._id}`
//       );
//     } catch (error) {
//       console.error('LinkedIn callback error:', error);
//       res.status(500).send('Internal Server ');
//     }
//   }
// );


// app.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { 
//     successRedirect:'/protected',
//     failureRedirect: 'https://bimrelyfrontend.vercel.app/login' 
        
//   }),
//   (req, res) => {
//     // Successful authentication, redirect or respond with a success message
//     res.send('Authentication successful!');
//   }
// );




app.get('/api/login', passport.authenticate('google', { scope: ['email','profile'] }));



app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'https://bimrelyfrontend.vercel.app/login' }),
  async (req, res) => {
    try {
      const user = req.user; // The user object from LinkedIn strategy
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
        expiresIn: '1h',
      });

      // Redirect to your frontend with token
      res.redirect(
        `https://bimrelyfrontend.vercel.app/auth/google/callback?token=${token}&user=${user._id}`
      );
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.status(500).send('Internal Server ');
    }
  }
);







app.get('/protected', isLoggedIn,async(req, res) => {
  
  
  // const {firstName} = req.body;

  // console.log(firstName);
  const data = await User.find();
  console.log(data)
  res.send(data);
});


routesForApp(app);

connectDB();

// Socket.io integration
// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });

//   // Add your custom events here
//   socket.on('example_event', (data) => {
//     console.log('example_event received:', data);
//     // Handle the event
//   });

//   socket.on('join', (userId) => {
//     socket.join(userId);
//   })
  
//   socket.on('like_article', (data) => {
  
//     console.log('example_event received:', data);
  
  
  
    
//   });

// });




app.listen(process.env.PORT, () => {
  console.log(`server is running on port: ${process.env.PORT}`);
});

// export default pusher ;

// export { io };







// import express from 'express';
// import cors from 'cors'
// import bodyParser from 'body-parser';
// import 'dotenv/config';
// import {connectDB} from './db.js'
// import routesForApp from './Routes.js';
// // import session from 'express-session';
// // import path from 'path';

// // import passport from './middleware/linkedInAuth.js';
// // import { User } from './Models/userModel.js';
// // import { initialize } from './Socket/socket.js';
// // import http from 'http';
// // import { Server } from 'socket.io';








// const app = express();
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(cors());
// app.use(express.json());









// app.get('/',(req,res) => {
//   res.send('Welcome to Node Babel')
//   console.log("running")
// })






// routesForApp(app);

// connectDB();

// app.listen(process.env.PORT, ()=>{
//   console.log(`server is running on port:" ${process.env.PORT}`);
 
//  });








// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);
// app.use('/images', express.static(path.join(__dirname, 'bim_copy', 'images')));
// const server = http.createServer(app);
// const io = new Server(server);

// io.on('connection', (socket) => {
//   console.log('a user connected');
// });

// initialize(server);

// app.use(
//     session({
//       secret: 'YOUR_SESSION_SECRET',
//       resave: false,
//       saveUninitialized: false,
//     })
//   );
  // server.js

// ... (existing code)

// Login route for google //
// app.get('/api/login', passport.authenticate('google', { scope: ['email','profile'] }));

// app.get(
//   '/auth/google/callback',
//   passport.authenticate('google', { 
//     successRedirect:'/protected',
//     failureRedirect: '/api/login/error' 
        
//   }),
//   (req, res) => {
//     // Successful authentication, redirect or respond with a success message
//     res.send('Authentication successful!');
//   }
// );


// Login route for linkedin //

// app.get('/api/login', passport.authenticate('linkedin', { scope:  ['email','profile'] }));

// app.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { 
//     successRedirect:'/protected',
//     failureRedirect: '/api/login/error' 
        
//   }),
//   (req, res) => {
//     // Successful authentication, redirect or respond with a success message
//     res.send('Authentication successful!');
//   }
// );


  
  




// // // app.get('/api/login/error', (req, res) => {
// // //   res.status(401).json({ error: 'Login failed' });
// // // });


// // app.get('/logout', passport.authenticate('google',{ scope: ['email','profile']}),(req, res) => {
  
// //   req.session = null;
// //   req.logout(); // This is assuming you are using the `passport` library for authentication
// //   res.redirect('/'); // Redirect the user to the desired page after logout
// // });




// app.get('/protected', isLoggedIn,async(req, res) => {
  
//   // const {firstName} = req.body;

//   // console.log(firstName);
//   const data = await User.find();
//   res.send(data);
// });



// app.use(express.json());

// app.use(cors());

// app.use(bodyParser.json());


   