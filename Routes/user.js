const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { User } = require("../schemas/User_Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/Middleware')


router.post("/register", async (req, resp) => {
  try {
    const { name, email, password, confirmpassword } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return resp.status(201).json({ message: "Email already exists" });
    } else {

      if (password !== confirmpassword) {
        return resp
          .status(202)
          .json({ success: false, message: "password not match" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
       user= await new User({name,email,password:hashedPassword})

      user.save();
      return resp
        .status(200)
        .json({ success: true, message: "User Registered Sucessfully" });
    }
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, resp) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const payload = { id: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        const {name}=user
        return resp
          .status(200)
          .json({
            success: true,
            message: "User Login Sucessfully",
            token: token,
            name:name
          });
        
      } else {
        return resp
          .status(201)
          .json({ success: false, message: "Invalid Password" });
      }
    }

    return resp
      .status(201)
      .json({ success: false, message: "User Not Registered" });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});



router.get('/alluser',async(req,resp)=>{
  try {
    const users = await User.find()
    return resp.status(200).json({ success: true, message:"Listed Users",data: users })
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
})

router.get("/search/:char?", async (req, resp) => {
  try {
    const { char } = req.params;
    
   
    const query = char ? { email: new RegExp(char, "i") } : {};
    const users = await User.find(query).select("-_id -password");

    if (users.length === 0) {
      return resp.status(201).json({
        success: true,
        message: "No users found with the specified criteria.",
        user: users,
      });
    }
    
    return resp.status(200).json({
      success: true,
      message: char 
        ? "Users filtered on the basis of your search" 
        : "All users listed",
      user: users
    });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});



router.put('/update',authMiddleware,async(req,resp)=>{
  const {name,email,oldpassword,newpassword} = req.body;
  const {user} = req
  try {
    const userToupdate= await User.findById(user)
   
    if(userToupdate){
    const  isMatch = await bcrypt.compare(oldpassword,userToupdate.password)
    if(isMatch){
      const hashedPassword = await bcrypt.hash(newpassword, 10)
      const updatedUser = await User.findByIdAndUpdate(user, { name, email,password:hashedPassword},{new:true})
      return resp.status(200).json({success:true,message:"User details updated successfully",updateDetails:updatedUser})
    }
    else{
      return resp.status(201).json({success:false,message:"Old password is incorrect"})
    }
    }
    return resp.status(201).json({success:false,message:"User Not Found"})
    
     
  } catch (error) {
    return resp.status(400).json({success:false,message:"Internal Serval Error",error:error.message})
  }
})


module.exports = router;
