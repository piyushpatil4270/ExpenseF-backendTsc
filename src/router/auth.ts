import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Users from "../models/user"
import {v4} from "uuid"
import nodemailer from "nodemailer"
import {NextFunction, Router,Request,Response} from "express"
import resetReq from "../models/ResetReq"

const router=Router()
const saltRounds=10

interface signUpBody{
    username:string,
    email:string,
    password:string
 }



 interface signInBody{
    email:string,
    password:string
 }



 const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
         user: 'piyushpatil4270@gmail.com',
        pass: 'uwzocqrsvibhjans'
    }
 })


const generateToken=(id:number)=>{
    const token=jwt.sign({userId:id},"faksjfklslkfsklf")
    return token
}


router.post("/signup",async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const body:signUpBody=req.body
        const existingUsername=await Users.findOne({where:{username:body.username}})
        if(existingUsername) return res.status(404).json("Username already exist")
        const existingEmail=await Users.findOne({where:{email:body.email}})
        if(existingEmail) return res.status(404).json("Email already exist")
        const hashedPassword:string=await bcrypt.hash(body.password,saltRounds)
        const user=await Users.create({
            username:body.username,
            email:body.email,
            password:hashedPassword
        })
        res.status(202).json("User created succesfully")   
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured while creating user")
    }
})



router.post("/signin",async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const body:signInBody=req.body
        console.log(req.body)
        const existingUser=await Users.findOne({where:{email:body.email}}) ;
        if(!existingUser) return res.status(404).json("Invalid email")
        const existingUserType=existingUser as any
        const checkPassword=await bcrypt.compare(body.password,existingUserType.password) 
        if(!checkPassword)return res.status(401).json("Invalid password")
        const token=generateToken(existingUserType.id)
        res.status(200).json({msg:"Login Successful",token:token})
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured while logging in please try again ")
    }
})



router.post("/forgot_password",async(req:Request,res:Response,next:NextFunction)=>{
    try {
      const {email}=req.body  
      const user=await Users.findOne({where:{email:email}})
      if(!user)return res.status(404).json("User with email doesnt exist")
    const uId=v4()
// @ts-ignore
const userId=user.id
    const resetPassReq=await resetReq.create({
        id:uId,
        isActive:true,
        userId:userId,
    })
    const mailOptions={
        from:'piyushpatil4270@gmail.com',
      to:email,
      subject:"Reset email ",
      text:"Successfully retrieve to old password",
      html:`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>
          <body>
            <a href="http://localhost:5500/reset_password/${uId}">Reset Password</a>
          </body>
        </html>`
    }
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log(err)
            return
        }
        console.log(info)
    })
    res.status(202).json(`Mail sent to ${email} successfully`)

    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured")
    }
})


router.post("/reset/:id",async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {id}=req.params
        console.log(req.body)
        const {email,password}=req.body
        const existingReq=await resetReq.findOne({where:{id:id}})
        if(!existingReq)return res.status(404).json("Request doesnt exist")
        const user=await Users.findOne({where:{email:email}})
        if(!user) return res.status(404).json("User doesnt exist")
        const hashedPassword=await bcrypt.hash(password,saltRounds)
    const update=await Users.update({password:hashedPassword},{where:{email:email}})
    if(update){
        await resetReq.update({isActive:false},{where:{id:id}})
        return res.status(202).json("Password updated successfully")
    }
    res.status(404).json("There was errro updating password")
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured while resetting password")
    }
})

export default router