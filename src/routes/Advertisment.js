// src/routes/advertisementRoutes.js
const express = require('express');
const uploadAdvertisement = require('../utili/Admulter.js');
const {
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} = require('../controllers/Advertisment.js');

const advertisment = express.Router();

advertisment.get('/all', getAllAdvertisements);
advertisment.post('/create', uploadAdvertisement.single('image'), createAdvertisement);
advertisment.put('/:id', uploadAdvertisement.single('image'), updateAdvertisement);
advertisment.delete('/:id', deleteAdvertisement);

module.exports = advertisment;
