import express from 'express';
import { createReview, getReviewsByPlace, getReviewSummary } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createReview);
router.get('/:placeId', getReviewsByPlace);
router.get('/summary/:placeId', getReviewSummary);

export default router;
