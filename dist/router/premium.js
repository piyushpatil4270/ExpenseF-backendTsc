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
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
function generateHash(key, txnid, amount, productinfo, firstname, email, salt) {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto_1.default.createHash('sha512').update(hashString).digest('hex');
}
router.post('/payu', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { txnid, amount, productinfo, firstname, email, phone } = req.body;
        const hash = generateHash(process.env.PAYU_KEY, txnid, amount, productinfo, firstname, email, process.env.PAYU_SALT);
        const payuData = {
            key: process.env.PAYU_KEY,
            txnid: txnid,
            amount: amount,
            productinfo: productinfo,
            firstname: firstname,
            email: email,
            phone: phone,
            surl: 'http://localhost:5500/premium/success',
            furl: 'http://localhost:5500/premium/failure',
            hash: hash,
            service_provider: 'payu_paisa',
        };
        res.status(200).json(Object.assign(Object.assign({}, payuData), { status: 'success' }));
    }
    catch (error) {
        console.error('Error in /payu endpoint:', error);
        res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
}));
router.post('/payu_response', (req, res) => {
    try {
        const { key, txnid, amount, productinfo, firstname, email, status, hash } = req.body;
        const newHash = generateHash(key, txnid, amount, productinfo, firstname, email, process.env.PAYU_SALT);
        if (newHash === hash) {
            res.status(200).json({ status: 'success', message: 'Payment Successful' });
        }
        else {
            res.status(400).json({ status: 'failure', message: 'Payment Verification Failed' });
        }
    }
    catch (error) {
        console.error('Error in /payu_response endpoint:', error);
        res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
});
router.post('/success', (req, res) => {
    res.json('Payment Successful');
});
router.post('/failure', (req, res) => {
    res.json('Payment failed');
});
exports.default = router;
