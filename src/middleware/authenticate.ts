import Users from "../models/user"
import {Request,Response,NextFunction} from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { userInfo } from "os"

interface userInfo{
    userId:number
}

interface User{
    id: number;
  username: string;
  email: string;
  password: string;
  totalExpenses: number;
  isPremium: boolean;
}


// class inheritance
interface CustomRequest extends Request{
    user?:User
}

export const authenticate=async(req:CustomRequest,res:Response,next:NextFunction)=>{
try {
    const token:string|undefined=req.header("Authorization")
    console.log("Token is ",token)
    if(!token) return res.status(404).json("You are not authorized")
    try {
        const decryptToken=jwt.verify(token,"faksjfklslkfsklf") as JwtPayload||userInfo
        const userId=decryptToken.userId
        const existingUser=await Users.findOne({where:{id:userId}})
        if(!existingUser) return res.status(404).json("User doesnt exist")
        const user=existingUser.toJSON() as User
        req.user=user
        next()
       
      
    } catch (error) {
        res.status(404).json(error)
    }
} catch (error) {
    console.log(error)
    res.status(404).json({success:false})
}
}


