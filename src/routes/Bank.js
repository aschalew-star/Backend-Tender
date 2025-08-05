const express = require('express');

const {
    createBank,
    getAllBanks,
    getBankById,
    updateBank,getBanksForPaymentForm,
    deleteBank,
} = require('../controllers/bank.js')
const bank = express.Router();


bank.post('/create', createBank);
bank.get('/all', getAllBanks);
bank.delete('/:id', deleteBank);
bank.get('/:id',  getBankById);
bank.get('/paybank',  getBanksForPaymentForm);
bank.put('/:id', updateBank,);

module.exports = bank;
