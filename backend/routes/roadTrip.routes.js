import express from "express";
import {
  createRoadTripPlan,
  getRoadTripPlanById,
  getRoadTripPlans
} from "../controllers/roadTrip.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

router.post("/", optionalAuthMiddleware, createRoadTripPlan);
router.get("/", authMiddleware, getRoadTripPlans);
router.get("/:id", authMiddleware, getRoadTripPlanById);

export default router;
