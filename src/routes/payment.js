const express=require('express');
const { createPayment, getPayments
    , deletePayment,rejectPayment,
  approvePayment,
    } = require('../controllers/paymentcontroller.js');

const payment = express.Router();

payment.get('/all', getPayments);
payment.post('/create', createPayment);
payment.get('/getpayment/:id', deletePayment);
payment.patch('/:id/approve',approvePayment)
payment.patch('/:id/rejected',rejectPayment)

module.exports=payment;