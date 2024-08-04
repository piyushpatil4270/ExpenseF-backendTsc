import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import path from "path"
import fs from "fs"
import db from "./utils/db"
import authRouter from "./router/auth"
import expenseRouter from "./router/expenses"
import premiumRouter from "./router/premium"
const app=express()
import Users from "./models/user"
import Expenses from "./models/expenses"
import resetReq from "./models/ResetReq"
import dotenv from "dotenv"
dotenv.config()

Users.hasMany(Expenses,{foreignKey:"userId"})
Users.hasMany(resetReq,{foreignKey:"userId"})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

db.sync()
.then(()=>console.log("Connected to the database"))
.catch((err:string)=>console.log("An error occured",err))

app.use(express.json())
app.use(cors())
app.use(bodyParser({extended:true}))

app.get("/",(req,res,next)=>{
    res.json("server started....")
})


app.get("/reset_password/:id",async(req,res,next)=>{
  const {id}=req.params
  const existingReq=await resetReq.findOne({where:{id:id}})
  // @ts-ignore
  if(existingReq && existingReq.isActive){
   return  res.render("email",{id})
  }
  res.json("Response timed out")
})
app.use("/auth",authRouter)
app.use("/expense",expenseRouter)
app.use("/premium",premiumRouter)



app.listen(process.env.PORT_NO,()=>console.log("Server started on port 5500"))