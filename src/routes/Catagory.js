const express=require('express');

const { getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/catagory');

const catagory = express.Router();


catagory.get('/all', getAllCategories);
catagory.put('/:id', updateCategory);
catagory.post('/create', createCategory);
catagory.delete('/:id', deleteCategory);


module.exports=catagory;