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
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = __importDefault(require("sequelize"));
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.post("/add", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const formattedDate = moment_1.default.utc(body.date).toDate();
        const newExpense = yield expenses_1.default.create({
            title: body.title,
            description: body.description,
            amount: body.amount,
            category: body.category,
            userId: userId,
            date: formattedDate
        });
        const existingUser = yield user_1.default.findOne({ where: { id: userId } });
        existingUser === null || existingUser === void 0 ? void 0 : existingUser.increment('totalExpenses', { by: body.amount });
        res.status(202).json("Expense added successfully");
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
}));
router.post("/getbyDay", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const skipExpenses = (body.page - 1) * (body.limit);
        const limit = body.limit;
        const startDate = moment_1.default.utc(body.date).startOf("day").toDate();
        const endDate = moment_1.default.utc(body.date).endOf("day").toDate();
        const { count, rows } = yield expenses_1.default.findAndCountAll({
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startDate, endDate]
                }
            },
            offset: skipExpenses,
            limit: limit
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startDate, endDate]
                }
            }
        });
        res.status(202).json({ expenses: rows, total: count, totalAmount: totalAmount });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
}));
router.post("/getbyMonth", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const startMonth = moment_1.default.utc(body.date).startOf("month").toDate();
        const endMonth = moment_1.default.utc(body.date).endOf("month").toDate();
        const skip = (body.page - 1) * body.limit;
        const { rows, count } = yield expenses_1.default.findAndCountAll({
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startMonth, endMonth]
                }
            },
            limit: body.limit,
            offset: skip,
            order: [sequelize_1.default.literal("DATE(date)")]
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startMonth, endMonth]
                }
            }
        });
        res.status(202).json({ expenses: rows, totalAmount: totalAmount, total: count });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
}));
router.post("/getbyYear", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const startYear = moment_1.default.utc(body.date).startOf('year').toDate();
        const endYear = moment_1.default.utc(body.date).endOf('year').toDate();
        const expenses = yield expenses_1.default.findAll({
            attributes: [
                [sequelize_1.default.fn('DATE_FORMAT', sequelize_1.default.col('date'), '%Y-%m'), 'month'],
                [sequelize_1.default.fn("SUM", sequelize_1.default.col("amount")), 'totalAmount']
            ],
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            },
            group: [sequelize_1.default.fn('DATE_FORMAT', sequelize_1.default.col('date'), '%Y-%m')],
            order: [sequelize_1.default.fn("DATE_FORMAT", sequelize_1.default.col("date"), '%Y-%m')]
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            }
        });
        res.status(202).json({ expenses: expenses, totalAmount: totalAmount, total: expenses.length });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
}));
router.post("/getbyMonthGrouped", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const date = body.date;
        const startYear = moment_1.default.utc(date).startOf("year").toDate();
        const endYear = moment_1.default.utc(date).endOf("year").toDate();
        const expenses = yield expenses_1.default.findAll({
            where: {
                userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            },
            order: [sequelize_1.default.literal('DATE(date)')]
        });
        const groupByMonth = expenses.reduce((acc, expense) => {
            /// @ts-ignore
            const month = (0, moment_1.default)(expense.date).format("MMMM");
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(expense);
            return acc;
        }, {});
        res.status(202).json(groupByMonth);
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured please try again");
    }
}));
router.post("/delete/:id", authenticate_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const { id: expenseId } = req.params;
        const userId = req.user.id;
        console.log(typeof expenseId);
        const newId = parseInt(expenseId);
        const expense = yield expenses_1.default.findOne({ where: { id: newId } });
        if (expense) {
            const amt = expense.toJSON().amount;
            const user = yield user_1.default.findByPk(userId);
            // @ts-ignore
            user.totalAmount -= amt;
            yield (user === null || user === void 0 ? void 0 : user.save());
            yield expense.destroy();
            return res.status(202).json("expense deleted");
        }
        res.status(202).json("expense not found");
    }
    catch (error) {
        res.status(404).json(error);
    }
}));
exports.default = router;
