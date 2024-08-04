import { Router } from "express";
import crypto from "crypto"

const router=Router()


function generateHash(key:any, txnid:any, amount:any, productinfo:any, firstname:any, email:any, salt:any) {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }
  
router.post('/payu', async (req, res, next) => {
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
  
      res.status(200).json({ ...payuData, status: 'success' });
    } catch (error) {
      console.error('Error in /payu endpoint:', error);
      res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
  });
  
  router.post('/payu_response', (req, res) => {
    try {
      const { key, txnid, amount, productinfo, firstname, email, status, hash } = req.body;
      const newHash = generateHash(key, txnid, amount, productinfo, firstname, email, process.env.PAYU_SALT);
      if (newHash === hash) {
        res.status(200).json({ status: 'success', message: 'Payment Successful' });
      } else {
        res.status(400).json({ status: 'failure', message: 'Payment Verification Failed' });
      }
    } catch (error) {
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



  export default router