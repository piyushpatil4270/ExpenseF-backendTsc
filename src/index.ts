import express from "express"
import cors from "cors"
import crypto from "crypto"
import bodyParser from "body-parser"
import path from "path"
import fs from "fs"
import db from "./utils/db"
import authRouter from "./router/auth"
import expenseRouter from "./router/expenses"
const app=express()


db.sync()
.then(()=>console.log("Connected to the database"))
.catch((err:string)=>console.log("An error occured"))

app.use("/auth",authRouter)
app.use("/expense",expenseRouter)



app.listen(5500,()=>console.log("Server started on port 5500"))