const express = require("express");
const router = express.Router();
const { Task } = require("../schemas/Schema");
const authMiddleware = require("../middlewares/Middleware");
const { User } = require("../schemas/User_Schema");

router.post("/create", authMiddleware, async (req, resp) => {
  try {
    const { taskname, priority, duedate, taskdata, assign } = req.body;
    const { user } = req;
    const { name } = await User.findById(user);
    
    let task;
    if (!assign) {
      task = new Task({
        taskname,
        priority,
        duedate,
        taskdata,
        creator: [user],
        creator_name: name,
      });
      task.save();
    } else {
     
      let emailString = assign;
      let email = emailString.replace(/"/g, "");
      const assign_user = await User.findOne({ email });
      console.log(assign_user);
      task = new Task({
        taskname,
        priority,
        duedate,
        taskdata,
        creator: [user, assign_user._id],
        creator_name: name,
        assignee_name: assign_user.name,
      });
      task.save();
    }

   
    return resp.json({
      success: true,
      message: "Task Created successfully",
      Task: task,
    });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});

router.get("/gettask", authMiddleware, async (req, resp) => {
  try {
    const { user } = req;
    console.log(user);
    const All_tasks = await Task.find();
    const userTasks = All_tasks.filter(
      (task) => task.creator.includes(user) 
    );
 
    return resp.status(200).json({
      success: true,
      message: "List of your jobs",
      user_task: userTasks,
    });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});


router.put("/update/:id", async (req, resp) => {
  try {
    const { id } = req.params;
    const { taskname, tasktype, priority, duedate, taskdata, assign } =
      req.body;
    let task;
    if (!assign) {
      task = await Task.findByIdAndUpdate(
        id,
        { taskname, priority, duedate, taskdata, tasktype },
        { new: true }
      );
    } else {
      let emailString = assign;
      let email = emailString.replace(/"/g, "");
      const assign_user = await User.findOne({ email });
      console.log(assign_user);
      task = await Task.findByIdAndUpdate(
        id,
        {
          taskname,
          priority,
          duedate,
          taskdata,
          $addToSet: { creator: assign_user._id },
          assignee_name: assign_user.name,
        },
        { new: true }
      );
    }
    return resp
      .status(200)
      .json({ success: true, message: "Update Successfully" });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});



router.put("/addboard",authMiddleware,async (req, resp) => {
  try {
    const { assign } = req.body;
    const{user} =req
    let emailString = assign;
    let email = emailString.replace(/"/g, "");
    const assign_user = await User.findOne({ email });
    if(!assign_user){
      return resp.status(404).json({ success: false, message: "User not found"})
    }
    const result = await Task.updateMany(
        { creator: user }, 
        { $addToSet: { creator: assign_user._id }
}
    );
    console.log(result)
 



  
    

    return resp.status(200).json({success:true,message:"Added to board Successfully",assignee:assign_user._id,mainuser:user})
  } 
  
  catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});


router.delete("/delete/:id", async (req, resp) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return resp
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    await Task.findByIdAndDelete(id);
    return resp
      .status(200)
      .json({ success: true, message: "Task Deleted Successfully" });
  } catch (error) {
    return resp.status(400).json({ success: false, message: error.message });
  }
});


router.get('/viewtask/:id',async(req,resp)=>{
  try {
    const {id} =req.params;
    const task= await Task.findById(id)
    if(!task){
      return resp.status(404).json({success:false,message:"Task does not exist"})
    }
    return resp.status(201).json({success:true,message:"task refelected",data:task})
  } catch (error) {
    return resp.status(400)
    
  }
})

module.exports = router;