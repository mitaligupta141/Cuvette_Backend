
const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')




const port =process.env.PORT
const UserRouter = require('./Routes/user')
const TaskRouter = require('./Routes/task')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())









app.use('/user',UserRouter)
app.use('/task',TaskRouter)





 
app.listen(port,()=>{
  console.log(`server is running on port ${port}`)
  mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
    console.log('Db Connected')
  }).catch((e)=>{
    console.log(e)
    console.log('failed to connect')
  })

})