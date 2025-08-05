const express=require('express');
const { createPayment, getAllPayments, getPaymentById,getCustomersForPaymentForm
    , approvePayment, deletePayment,
    } = require('../controllers/paymentcontroller.js');

const payment = express.Router();

payment.get('/all', getAllPayments);
payment.post('/create', createPayment);
payment.get('/getpayment/:id', deletePayment);

module.exports=payment;