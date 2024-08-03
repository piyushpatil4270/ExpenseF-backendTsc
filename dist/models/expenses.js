"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
const sequelize_1 = __importDefault(require("sequelize"));
const Expenses = db_1.default.define("Expenses", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    userId: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    description: {
        type: sequelize_1.default.STRING
    },
    amount: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    date: {
        type: sequelize_1.default.DATE,
        allowNull: false,
        defaultValue: sequelize_1.default.NOW
    },
    category: sequelize_1.default.STRING
}, {
    timestamps: false
});
exports.default = Expenses;
