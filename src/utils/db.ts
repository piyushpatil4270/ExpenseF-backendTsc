import {Sequelize} from "sequelize"

const db= new Sequelize("Expense_Tracker","root","Piyush@nyc85",{dialect:"mysql",host:"localhost"})

export default db;