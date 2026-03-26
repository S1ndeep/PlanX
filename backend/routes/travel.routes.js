import express from "express";
import {
  autoPlanTrip,
  getTripBudget,
  getRoutePreview,
  getWeatherForecast,
  optimizeRouteOrder,
  weatherSmartReplan
} from "../controllers/travel.controller.js";

const router = express.Router();

router.post("/route", getRoutePreview);
router.post("/budget", getTripBudget);
router.get("/weather", getWeatherForecast);
router.post("/optimize", optimizeRouteOrder);
router.post("/auto-plan", autoPlanTrip);
router.post("/weather-replan", weatherSmartReplan);

export default router;
