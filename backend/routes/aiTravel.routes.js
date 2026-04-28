import express from "express";
import {
  generateAiItinerary,
  getTravelRecommendations
} from "../controllers/aiTravel.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

router.post("/itinerary", optionalAuthMiddleware, generateAiItinerary);
router.get("/recommendations", authMiddleware, getTravelRecommendations);

export default router;
