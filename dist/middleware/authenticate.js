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
exports.authenticate = void 0;
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const os_1 = require("os");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(404).json("You are not authorized");
        try {
            const decryptToken = jsonwebtoken_1.default.verify(token, "faksjfklslkfsklf") || os_1.userInfo;
            const userId = decryptToken.userId;
            const existingUser = yield user_1.default.findOne({ where: { id: userId } });
            if (!existingUser)
                return res.status(404).json("User doesnt exist");
            const user = existingUser.toJSON();
            req.user = user;
            next();
        }
        catch (error) {
            res.status(404).json("You are not authorized");
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ success: false });
    }
});
exports.authenticate = authenticate;
