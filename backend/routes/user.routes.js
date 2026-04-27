import express from "express";
import {
  getFeaturedReviews,
  getPublicUserProfile,
  upsertUserReview
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/reviews/featured", getFeaturedReviews);
router.get("/:id", getPublicUserProfile);
router.post("/:userId/reviews", authMiddleware, upsertUserReview);

export default router;
