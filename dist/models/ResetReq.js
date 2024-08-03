"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../utils/db"));
const Request = db_1.default.define("Reset_req", {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    isActive: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: false
});
exports.default = Request;
