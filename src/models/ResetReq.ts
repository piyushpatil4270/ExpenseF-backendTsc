import Sequelize from "sequelize"
import sequelize from "../utils/db"

const Request = sequelize.define("Reset_req",{
    id:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    userId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    }
},{
    timestamps:false
})

export default Request