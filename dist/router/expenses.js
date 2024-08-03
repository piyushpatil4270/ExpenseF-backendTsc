"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenses_1 = __importDefault(require("../models/expenses"));
const user_1 = __importDefault(require("../models/user"));
const router = (0, express_1.Router)();
router.post("/add", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const newExpense = yield expenses_1.default.create({
            title: body.title,
            description: body.description,
            amount: body.amount,
            category: body.category,
            userId: userId
        });
        const existingUser = yield user_1.default.findOne({ where: { id: userId } });
        existingUser === null || existingUser === void 0 ? void 0 : existingUser.increment('totalExpenses', { by: body.amount });
        res.status(202).json("Expense added successfully");
    }
    catch (error) {
        console.log(error);
        res.status(404).json(error);
    }
}));
exports.default = router;
