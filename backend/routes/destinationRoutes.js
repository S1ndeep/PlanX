import express from 'express';
import { getDestinationDetails } from '../controllers/destinationController.js';

const router = express.Router();

// GET /api/destination/:cityName
router.get('/:cityName', getDestinationDetails);

export default router;
