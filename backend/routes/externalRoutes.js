import express from "express";
import { searchCities } from "../controllers/externalController.js";

const router = express.Router();

router.get("/cities", searchCities);

export default router;
