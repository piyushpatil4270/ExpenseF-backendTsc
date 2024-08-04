import e, {Router,Request,Response,NextFunction} from "express"
import Expenses from "../models/expenses"
import Users from "../models/user"
import moment from "moment"
import sequelize, { Sequelize, where } from "sequelize"
import {authenticate} from "../middleware/authenticate"
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

interface ExpensebyDate{
    limit:number,
    page:number,
    date:Date
}


// class inheritance
interface CustomRequest extends Request{
    user?:User
}

router.post("/add",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
try {
    if(!req.user) return res.status(404).json("Your are not authorized")
    const userId=req.user.id
    const body:ExpenseBody=req.body
    const formattedDate:Date=moment.utc(body.date).toDate()
    const newExpense=await Expenses.create({
        title:body.title,
        description:body.description,
        amount:body.amount,
        category:body.category,
        userId:userId,
        date:formattedDate
    })
    const existingUser=await Users.findOne({where:{id:userId}})
    existingUser?.increment('totalExpenses',{by:body.amount})
    res.status(202).json("Expense added successfully")

} catch (error) {
    console.log(error)
    res.status(404).json("An error occured try again")
}
})


router.post("/getbyDay",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
        const userId=req.user.id
        const body:ExpensebyDate=req.body
        const skipExpenses:number=(body.page-1)*(body.limit)
        const limit:number=body.limit
        const startDate:Date=moment.utc(body.date).startOf("day").toDate()
        const endDate:Date=moment.utc(body.date).endOf("day").toDate()
        const {count,rows}=await Expenses.findAndCountAll({
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startDate,endDate]
                }
            },
            offset:skipExpenses,
            limit:limit
        })

        const totalAmount=await Expenses.sum("amount",{
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startDate,endDate]
                }
            }
        })
        res.status(202).json({expenses:rows,total:count,totalAmount:totalAmount})
    
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
    })


router.post("/getbyMonth",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
        const userId=req.user.id
        const body:ExpensebyDate=req.body
        const startMonth:Date=moment.utc(body.date).startOf("month").toDate()
        const endMonth:Date=moment.utc(body.date).endOf("month").toDate()
        const skip:number=(body.page-1)*body.limit
        const {rows,count}=await Expenses.findAndCountAll({
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startMonth,endMonth]
                }
            },
            limit:body.limit,
            offset:skip,
            order:[sequelize.literal("DATE(date)")]
        })
        const totalAmount=await Expenses.sum("amount",{
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startMonth,endMonth]
                }
            }
        })
        res.status(202).json({expenses:rows,totalAmount:totalAmount,total:count})

    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
})


router.post("/getbyYear",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
        const userId=req.user.id
        const body:ExpensebyDate=req.body
        const startYear:Date=moment.utc(body.date).startOf('year').toDate()
        const endYear:Date=moment.utc(body.date).endOf('year').toDate()
        
        const expenses=await Expenses.findAll({
            attributes:[
                [sequelize.fn('DATE_FORMAT',sequelize.col('date'),'%Y-%m'),'month'],
                [sequelize.fn("SUM",sequelize.col("amount")),'totalAmount']
            ],
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startYear,endYear]
                }
            },
            group:[sequelize.fn('DATE_FORMAT',sequelize.col('date'),'%Y-%m')],
            order:[sequelize.fn("DATE_FORMAT",sequelize.col("date"),'%Y-%m')]
        })
        const totalAmount=await Expenses.sum("amount",{
            where:{userId:userId,
                date:{
                    [sequelize.Op.between]:[startYear,endYear]
                }
            }
        })
        res.status(202).json({expenses:expenses,totalAmount:totalAmount,total:expenses.length})

    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
})



router.post("/getbyMonthGrouped",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
        const userId=req.user.id
        const body=req.body
        const date:Date=body.date
        const startYear=moment.utc(date).startOf("year").toDate()
        const endYear=moment.utc(date).endOf("year").toDate()
        const expenses=await Expenses.findAll({
            where:{
                userId:userId,
                date:{
                    [sequelize.Op.between]:[startYear,endYear]
                }
            },
            order:[sequelize.literal('DATE(date)')]
        }) 
        

        const groupByMonth=expenses.reduce((acc:{[key:string]:typeof expenses},expense)=>{
            /// @ts-ignore
            const month=moment(expense.date).format("MMMM")
            if(!acc[month]){
              acc[month]=[]
            }
            acc[month].push(expense)
            return acc
            },{})
       res.status(202).json(groupByMonth)
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured please try again")
    }
})



router.post("/delete/:id",async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
            const userId=req.user.id
        const expenseId:string=req.params.id

        const numberId:number=parseInt(expenseId)
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