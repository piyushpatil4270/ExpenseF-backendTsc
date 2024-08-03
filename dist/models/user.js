"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../utils/db"));
const Users = db_1.default.define("Users", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    isPremium: {
        type: sequelize_1.default.BOOLEAN,
        defaultValue: false
    },
    password: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    totalExpenses: {
        type: sequelize_1.default.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: false
});
exports.default = Users;
