import userRoute from "./Controllers/index.js"
import postRoute from "./PostControllers/index.js"



export default app => {

    app.use('/api/user', userRoute);
    app.use('/api/post', postRoute);
  

};