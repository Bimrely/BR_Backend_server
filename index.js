import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import 'dotenv/config';
import {connectDB} from './db.js'
import routesForApp from './Routes.js';
import session from 'express-session';
// import passport from './middleware/googleAuth.js';
import passport from './middleware/linkedInAuth.js';
import { User } from './Models/userModel.js';
import { initialize } from './Socket/socket.js';
import http from 'http';
import { Server } from 'socket.io';




function isLoggedIn(req,res,next){
!req.user ? next(): res.sendStatus(401);

}



const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use((req, res, next) => {
  req.io = io;
  
  next();
});

initialize(server);

app.use(
    session({
      secret: 'YOUR_SESSION_SECRET',
      resave: false,
      saveUninitialized: false,
    })
  );
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

app.get('/api/login', passport.authenticate('linkedin', { scope:  ['r_emailaddress','r_liteprofile'] }));

app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { 
    successRedirect:'/protected',
    failureRedirect: '/api/login/error' 
        
  }),
  (req, res) => {
    // Successful authentication, redirect or respond with a success message
    res.send('Authentication successful!');
  }
);


  
  




// app.get('/api/login/error', (req, res) => {
//   res.status(401).json({ error: 'Login failed' });
// });


app.get('/logout', passport.authenticate('google',{ scope: ['email','profile']}),(req, res) => {
  
  req.session = null;
  req.logout(); // This is assuming you are using the `passport` library for authentication
  res.redirect('/'); // Redirect the user to the desired page after logout
});




app.get('/protected', isLoggedIn,async(req, res) => {
  
  // const {firstName} = req.body;

  // console.log(firstName);
  const data = await User.find();
  res.send(data);
});



app.use(express.json());

app.use(cors());

app.use(bodyParser.json());


app.get('/',(req,res) => {
    res.send('Welcome to Node Babel')
    console.log("running")
})



  


routesForApp(app);

connectDB();

app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port:" ${process.env.PORT}`);
   
   });


   