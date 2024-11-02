const jwt=require("jsonwebtoken")
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req,resp,next) =>{
  const token=req.headers.authorization
  if(!token) return resp.status(201).json({message:"No token provided"})
    try {
  const decoded = jwt.verify(token,process.env.JWT_SECRET)
  req.user=decoded.id
  next()
      
    } catch (error) {

      resp.status(401).json({ message: "User is not logged in" });
    }
}
module.exports=authMiddleware