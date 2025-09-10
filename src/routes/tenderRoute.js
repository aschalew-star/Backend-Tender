// import express from 'express';
const express = require('express');
const upload=require('../utili/multer.js');
const {
  createtender,getAllTenders,updateTender,getTenderById,getAllTenderDocs,getAllBiddingDocs
//   createTenderNoFiles,
//   getAllTenders,
//   getTenderById,
//   updateTender,
//   deleteTender,
//   getpostedbytender,
//   gettenderbycategory,
//   getapprovedByIdtender,
//   gettenderbysubcatagory,
//   getfreetender,
//   getpaidtender,
//   getexpiredtender,
//   getactiveTender,
//   gettendetincataandsub,
//   getTendersByCategoryStats,
} = require('../controllers/tendercontroller.js');

const tender = express.Router();

tender.post(
  '/create',
 upload,
  
  createtender
);
tender.get('/all', getAllTenders);
tender.get('/tenderdoc', getAllTenderDocs);
tender.get('/tenderbid', getAllBiddingDocs);
tender.get('/:id',getTenderById);
tender.patch('/update/:id', upload, updateTender);

// router.post('/', authenticate, createTenderValidation, validate, createTenderNoFiles);
// router.get('/', authenticate, getAllTenders);
// router.get('/:id', authenticate, getTenderById);
// router.put('/:id', authenticate, createTenderValidation, validate, updateTender);
// router.delete('/:id', authenticate, deleteTender);
// router.get('/posted-by/:userId', authenticate, getpostedbytender);
// router.get('/category/:categoryId', authenticate, gettenderbycategory);
// router.get('/approved/:id', authenticate, getapprovedByIdtender);
// router.get('/subcategory/:subcategoryId', authenticate, gettenderbysubcatagory);
// router.get('/free', authenticate, getfreetender);
// router.get('/paid', authenticate, getpaidtender);
// router.get('/expired', authenticate, getexpiredtender);
// router.get('/active', authenticate, getactiveTender);
// router.get('/category/:categoryId/subcategory/:subcategoryId', authenticate, gettendetincataandsub);
// router.get('/stats/tenders-by-category', authenticate, getTendersByCategoryStats);

module.exports = tender;