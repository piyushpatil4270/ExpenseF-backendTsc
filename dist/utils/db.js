"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db = new sequelize_1.Sequelize("Expense_Tracker", "root", "Piyush@nyc85", { dialect: "mysql", host: "localhost" });
exports.default = db;
