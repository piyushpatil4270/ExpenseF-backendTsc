import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Users from "../models/user"
import {v4} from "uuid"
import {NextFunction, Router,Request,Response} from "express"

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


export default router