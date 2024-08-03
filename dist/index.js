"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./utils/db"));
const auth_1 = __importDefault(require("./router/auth"));
const expenses_1 = __importDefault(require("./router/expenses"));
const app = (0, express_1.default)();
db_1.default.sync()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.log("An error occured"));
app.use("/auth", auth_1.default);
app.use("/expense", expenses_1.default);
app.listen(5500, () => console.log("Server started on port 5500"));
