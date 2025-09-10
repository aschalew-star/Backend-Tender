const { getPurchasedTenderDocs,
  getPurchasedBiddingDocs,
    getCustomerNotifications } = require('../controllers/tenderdoc.js');
const express = require('express');
  

const tenderdoc = express.Router();

tenderdoc.get('/PurchasedTenderDocs/:id', getPurchasedTenderDocs);
tenderdoc.get('/PurchasedBiddingDocs/:id', getPurchasedBiddingDocs);
tenderdoc.get('/tenderdoc/:id',  getCustomerNotifications);

module.exports = tenderdoc;