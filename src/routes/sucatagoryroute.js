const express = require('express');
const { createSubcategory } = require('../controllers/subcatagory.js');

const subcatagory = express.Router();

subcatagory.post(
  '/create',createSubcategory
),
  
module.exports = subcatagory;