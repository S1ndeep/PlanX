import express from "express";
import { generateItinerary } from "../controllers/itineraryController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateItinerary);

export default router;
