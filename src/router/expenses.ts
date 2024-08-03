import {Router,Request,Response,NextFunction} from "express"
import Expenses from "../models/expenses"
import Users from "../models/user"
import moment from "moment"
import sequelize, { where } from "sequelize"
const router=Router()


interface ExpenseBody{
    title:string,
    description:string,
    category:string,
    amount:number,
    date:Date
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

router.post("/add",async(req:CustomRequest,res:Response,next:NextFunction)=>{
try {
    if(!req.user) return res.status(404).json("Your are not authorized")
    const userId=req.user.id
    const body:ExpenseBody=req.body
    const newExpense=await Expenses.create({
        title:body.title,
        description:body.description,
        amount:body.amount,
        category:body.category,
        userId:userId
    })
    const existingUser=await Users.findOne({where:{id:userId}})
    existingUser?.increment('totalExpenses',{by:body.amount})
    res.status(202).json("Expense added successfully")

} catch (error) {
    console.log(error)
    res.status(404).json("An error occured try again")
}
})



router.post("/delete/:id",async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
            const userId=req.user.id
        const expenseId:string=req.params.id

        const numberId=parseInt(expenseId)
        const expense=await Expenses.findByPk(numberId)
        const userExpense=expense?.toJSON()
        await expense?.destroy()
        const existingUser=await Users.findOne({where:{id:userId}})
        const user=existingUser?.toJSON()
         user.totalExpenses-=userExpense.amount
         await user.save()
         res.status(202).json("Expense deleted successfully")
        

    } catch (error) {
        res.status(404).json("An error occured try again")
    }
})




export default router