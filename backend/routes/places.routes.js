import express from "express";
import { getPlacesItinerary, searchPlaces } from "../controllers/places.controller.js";

const router = express.Router();

router.get("/places", searchPlaces);
router.post("/places", getPlacesItinerary);

export default router;
