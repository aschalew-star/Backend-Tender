const express = require('express');
const {
  getSubcategoryById, getAllSubcategories,
  createSubcategory, updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcatagory');

const subcatagory = express.Router();

subcatagory.post(
  '/create',createSubcategory
)
subcatagory.get(
  '/all',getAllSubcategories
)
subcatagory.get(
  '/:id',getSubcategoryById
)
subcatagory.put(
  '/:id',updateSubcategory
)
subcatagory.delete(
  '/:id',deleteSubcategory
)


  
  
module.exports = subcatagory;