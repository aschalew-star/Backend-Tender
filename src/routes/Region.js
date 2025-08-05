const express = require('express');
const { 
    createRegion,
    getAllRegions,
    getRegionById,
    updateRegion,
    deleteRegion
} = require('../controllers/region.js');

const region= express.Router();

// Create Region
region.post('/create', createRegion);
// Get All Regions
region.get('/all', getAllRegions);
// Get Region by Id
region.get('/:id', getRegionById);
// Update Region
region.put('/:id', updateRegion);
// Delete Region
region.delete('/:id', deleteRegion);

module.exports = region;