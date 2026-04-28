import express from "express";
import {
  createTrip,
  deleteTrip,
  getMyTrips,
  getTripById,
  importSharedTrip,
  updateTripStatus,
  upsertTripReview
} from "../controllers/trip.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createTrip);
router.get("/my-trips", authMiddleware, getMyTrips);
router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getMyTrips);
router.post("/:id/import", authMiddleware, importSharedTrip);
router.patch("/:id/status", authMiddleware, updateTripStatus);
router.patch("/:id/review", authMiddleware, upsertTripReview);
router.delete("/:id", authMiddleware, deleteTrip);
router.get("/:id", getTripById);

export default router;
