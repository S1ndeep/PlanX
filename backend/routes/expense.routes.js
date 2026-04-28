import express from "express";
import {
  createExpense,
  deleteExpense,
  estimateItineraryCosts,
  getExpenses
} from "../controllers/expense.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpenses);
router.delete("/:id", authMiddleware, deleteExpense);
router.post("/estimate", optionalAuthMiddleware, estimateItineraryCosts);

export default router;
