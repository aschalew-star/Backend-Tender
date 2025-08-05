import express from 'express';
import { restrictToRoles } from '../middleware/rolebasedauth.js';


const tender = express.Router();

router.get('/tenderdoc', tender);
router.post('/create-tenderdoc', createtender);
router.get('/tenderdoc/:id',  getTenderById);

export default tender;