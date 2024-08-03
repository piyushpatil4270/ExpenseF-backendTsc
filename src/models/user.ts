import Sequelize from "sequelize";
import sequelize from "../utils/db"


const Users=sequelize.define("Users",{
    id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    },
    username:{
        type:Sequelize.STRING,
        allowNull:false
      },
      email:{
        type:Sequelize.STRING,
        allowNull:false
      },
      isPremium:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
      },
      password:{
        type:Sequelize.STRING,
        allowNull:false
      },
      totalExpenses:{
        type:Sequelize.INTEGER,
        defaultValue:0
      }
    },{
      timestamps:false
})

export default Users;