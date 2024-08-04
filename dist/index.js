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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./utils/db"));
const auth_1 = __importDefault(require("./router/auth"));
const expenses_1 = __importDefault(require("./router/expenses"));
const premium_1 = __importDefault(require("./router/premium"));
const app = (0, express_1.default)();
const user_1 = __importDefault(require("./models/user"));
const expenses_2 = __importDefault(require("./models/expenses"));
const ResetReq_1 = __importDefault(require("./models/ResetReq"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
user_1.default.hasMany(expenses_2.default, { foreignKey: "userId" });
user_1.default.hasMany(ResetReq_1.default, { foreignKey: "userId" });
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
db_1.default.sync()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.log("An error occured", err));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, body_parser_1.default)({ extended: true }));
app.get("/", (req, res, next) => {
    res.json("server started and we are live....");
});
app.get("/reset_password/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingReq = yield ResetReq_1.default.findOne({ where: { id: id } });
    // @ts-ignore
    if (existingReq && existingReq.isActive) {
        return res.render("email", { id });
    }
    res.json("Response timed out");
}));
app.use("/auth", auth_1.default);
app.use("/expense", expenses_1.default);
app.use("/premium", premium_1.default);
app.listen(process.env.PORT_NO, () => console.log("Server started on port 5500"));
