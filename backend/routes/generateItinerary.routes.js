import express from "express";
import { generateItinerary } from "../controllers/generateItineraryController.js";
const router = express.Router();

router.post("/generate-itinerary", generateItinerary);

export default router;
