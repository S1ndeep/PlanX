import express from "express";
import {
  createGroupTrip,
  createVoteOption,
  deleteGroupTrip,
  getGroupTrip,
  getMyGroupTrips,
  inviteMemberByEmail,
  joinGroupByInvite,
  pollGroupUpdates,
  toggleVote,
  updateSharedItinerary
} from "../controllers/groupTrip.controller.js";
import optionalAuthMiddleware from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

router.post("/", optionalAuthMiddleware, createGroupTrip);
router.get("/", optionalAuthMiddleware, getMyGroupTrips);
router.post("/join/:token", optionalAuthMiddleware, joinGroupByInvite);
router.get("/:id", optionalAuthMiddleware, getGroupTrip);
router.get("/:id/poll", optionalAuthMiddleware, pollGroupUpdates);
router.post("/:id/invite", optionalAuthMiddleware, inviteMemberByEmail);
router.patch("/:id/itinerary", optionalAuthMiddleware, updateSharedItinerary);
router.post("/:id/votes", optionalAuthMiddleware, createVoteOption);
router.post("/:id/votes/:optionId/toggle", optionalAuthMiddleware, toggleVote);
router.delete("/:id", optionalAuthMiddleware, deleteGroupTrip);

export default router;
