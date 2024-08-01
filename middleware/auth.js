import jwt from "jsonwebtoken"
const SECRET_KEY = "SECRET";


export const auth = async(req,res,next)=>{

let token = req.headers.authorization;

if(token){
    token = token.split(" ")[1]; 
     let user = jwt.verify(token,SECRET_KEY,);
     req.userId = user.id;
}
else{
    res.status(401).json({message:"unAuthorized User"});
}

next();

}