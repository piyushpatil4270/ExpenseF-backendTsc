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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_1 = require("express");
const ResetReq_1 = __importDefault(require("../models/ResetReq"));
const router = (0, express_1.Router)();
const saltRounds = 10;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: 'piyushpatil4270@gmail.com',
        pass: 'uwzocqrsvibhjans'
    }
});
const generateToken = (id) => {
    const token = jsonwebtoken_1.default.sign({ userId: id }, "faksjfklslkfsklf");
    return token;
};
router.post("/signup", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const existingUsername = yield user_1.default.findOne({ where: { username: body.username } });
        if (existingUsername)
            return res.status(404).json("Username already exist");
        const existingEmail = yield user_1.default.findOne({ where: { email: body.email } });
        if (existingEmail)
            return res.status(404).json("Email already exist");
        const hashedPassword = yield bcrypt_1.default.hash(body.password, saltRounds);
        const user = yield user_1.default.create({
            username: body.username,
            email: body.email,
            password: hashedPassword
        });
        res.status(202).json("User created succesfully");
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured while creating user");
    }
}));
router.post("/signin", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        console.log(req.body);
        const existingUser = yield user_1.default.findOne({ where: { email: body.email } });
        if (!existingUser)
            return res.status(404).json("Invalid email");
        const existingUserType = existingUser;
        const checkPassword = yield bcrypt_1.default.compare(body.password, existingUserType.password);
        if (!checkPassword)
            return res.status(401).json("Invalid password");
        const token = generateToken(existingUserType.id);
        res.status(200).json({ msg: "Login Successful", token: token });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured while logging in please try again ");
    }
}));
router.post("/forgot_password", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_1.default.findOne({ where: { email: email } });
        if (!user)
            return res.status(404).json("User with email doesnt exist");
        const uId = (0, uuid_1.v4)();
        // @ts-ignore
        const userId = user.id;
        const resetPassReq = yield ResetReq_1.default.create({
            id: uId,
            isActive: true,
            userId: userId,
        });
        const mailOptions = {
            from: 'piyushpatil4270@gmail.com',
            to: email,
            subject: "Reset email ",
            text: "Successfully retrieve to old password",
            html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>
          <body>
            <a href="http://localhost:5500/reset_password/${uId}">Reset Password</a>
          </body>
        </html>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(info);
        });
        res.status(202).json(`Mail sent to ${email} successfully`);
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured");
    }
}));
router.post("/reset/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(req.body);
        const { email, password } = req.body;
        const existingReq = yield ResetReq_1.default.findOne({ where: { id: id } });
        if (!existingReq)
            return res.status(404).json("Request doesnt exist");
        const user = yield user_1.default.findOne({ where: { email: email } });
        if (!user)
            return res.status(404).json("User doesnt exist");
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const update = yield user_1.default.update({ password: hashedPassword }, { where: { email: email } });
        if (update) {
            yield ResetReq_1.default.update({ isActive: false }, { where: { id: id } });
            return res.status(202).json("Password updated successfully");
        }
        res.status(404).json("There was errro updating password");
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured while resetting password");
    }
}));
exports.default = router;
