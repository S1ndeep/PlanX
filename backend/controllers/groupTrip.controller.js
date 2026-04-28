import mongoose from "mongoose";
import GroupTrip from "../models/GroupTrip.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { sendControllerError } from "../utils/httpError.js";

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const requirePlanningIdentity = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Login or guest planning identity is required" });
    return false;
  }

  return true;
};

const isMember = (groupTrip, userId) => {
  const normalizedUserId = toIdString(userId);
  return groupTrip.members.some((member) => toIdString(member.userId) === normalizedUserId);
};

const isAdmin = (groupTrip, userId) => {
  const normalizedUserId = toIdString(userId);
  return groupTrip.members.some(
    (member) => toIdString(member.userId) === normalizedUserId && member.role === "admin"
  );
};

const appendActivity = (groupTrip, actorId, action, payload = {}) => {
  groupTrip.activityLog.push({
    actorId,
    action,
    payload,
    createdAt: new Date()
  });
};

const getFrontendBaseUrl = (req) => {
  const requestOrigin = req.get("origin");

  if (requestOrigin && process.env.NODE_ENV !== "production") {
    return requestOrigin.replace(/\/+$/, "");
  }

  const configuredUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();
  return configuredUrl.replace(/\/+$/, "");
};

export const createGroupTrip = async (req, res) => {
  try {
    const { name, destination = "", tripId = null, itinerary = {} } = req.body || {};
    const normalizedName = String(name || "").trim();

    if (!normalizedName) {
      return res.status(400).json({ message: "name is required" });
    }

    const ownerId = req.user?.id || new mongoose.Types.ObjectId().toString();
    const isGuestOwner = Boolean(req.user?.isGuest || !req.user?.id);

    const groupTrip = await GroupTrip.create({
      name: normalizedName,
      destination,
      tripId,
      itinerary,
      createdBy: ownerId,
      members: [{ userId: ownerId, role: "admin" }],
      activityLog: [{ actorId: ownerId, action: "group.created", createdAt: new Date() }]
    });

    return res.status(201).json({
      groupTrip,
      inviteUrl: `${getFrontendBaseUrl(req)}/groups/join/${groupTrip.inviteToken}`,
      guestId: isGuestOwner ? ownerId : null
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create group trip");
  }
};

export const getMyGroupTrips = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groups = await GroupTrip.find({ "members.userId": req.user.id }).sort({ updatedAt: -1 });
    return res.json({ groups });
  } catch (error) {
    return sendControllerError(res, error, "Failed to fetch group trips");
  }
};

export const getGroupTrip = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findById(req.params.id).populate("members.userId", "name email profilePicture");

    if (!groupTrip || !isMember(groupTrip, req.user.id)) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    return res.json({ groupTrip });
  } catch (error) {
    return sendControllerError(res, error, "Failed to fetch group trip");
  }
};

export const joinGroupByInvite = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findOne({ inviteToken: req.params.token });

    if (!groupTrip) {
      return res.status(404).json({ message: "Invite link is invalid or expired" });
    }

    if (!isMember(groupTrip, req.user.id)) {
      groupTrip.members.push({ userId: req.user.id, role: "member" });
      appendActivity(groupTrip, req.user.id, "member.joined");
      await groupTrip.save();
    }

    return res.json({ groupTrip });
  } catch (error) {
    return sendControllerError(res, error, "Failed to join group trip");
  }
};

export const inviteMemberByEmail = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const { email } = req.body || {};
    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip || !isAdmin(groupTrip, req.user.id)) {
      return res.status(403).json({ message: "Only group admins can invite members" });
    }

    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
    if (user && !isMember(groupTrip, user._id)) {
      groupTrip.members.push({ userId: user._id, role: "member" });
      appendActivity(groupTrip, req.user.id, "member.invited", { email });
      await groupTrip.save();
    }

    return res.json({
      message: user ? "Member added to group" : "Invite link generated for email sharing",
      inviteUrl: `${getFrontendBaseUrl(req)}/groups/join/${groupTrip.inviteToken}`,
      groupTrip
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to invite member");
  }
};

export const updateSharedItinerary = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip || !isMember(groupTrip, req.user.id)) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    groupTrip.itinerary = req.body.itinerary || {};
    appendActivity(groupTrip, req.user.id, "itinerary.updated");
    await groupTrip.save();

    return res.json({ groupTrip });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update itinerary");
  }
};

export const createVoteOption = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const { title, description = "" } = req.body || {};
    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip || !isMember(groupTrip, req.user.id)) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    groupTrip.voteOptions.push({ title, description, votes: [] });
    appendActivity(groupTrip, req.user.id, "vote.created", { title });
    await groupTrip.save();

    return res.status(201).json({ groupTrip });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create vote option");
  }
};

export const toggleVote = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip || !isMember(groupTrip, req.user.id)) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    const option = groupTrip.voteOptions.id(req.params.optionId);
    if (!option) {
      return res.status(404).json({ message: "Vote option not found" });
    }

    const currentVotes = option.votes.map((vote) => String(vote));
    option.votes = currentVotes.includes(String(req.user.id))
      ? option.votes.filter((vote) => String(vote) !== String(req.user.id))
      : [...option.votes, req.user.id];

    appendActivity(groupTrip, req.user.id, "vote.toggled", { optionId: req.params.optionId });
    await groupTrip.save();

    return res.json({ groupTrip });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update vote");
  }
};

export const pollGroupUpdates = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip || !isMember(groupTrip, req.user.id)) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    const since = req.query.since ? new Date(req.query.since) : null;
    const hasUpdates = since ? groupTrip.updatedAt > since : true;

    return res.json({
      hasUpdates,
      serverTime: new Date().toISOString(),
      groupTrip: hasUpdates ? groupTrip : null
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to poll group updates");
  }
};

export const deleteGroupTrip = async (req, res) => {
  try {
    if (!requirePlanningIdentity(req, res)) return;

    const groupTrip = await GroupTrip.findById(req.params.id);

    if (!groupTrip) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    if (!isAdmin(groupTrip, req.user.id)) {
      return res.status(403).json({ message: "Only group admins can delete this group" });
    }

    await Expense.deleteMany({ groupTripId: groupTrip._id });
    await groupTrip.deleteOne();

    return res.json({
      message: "Group deleted successfully",
      deletedGroupId: req.params.id
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to delete group trip");
  }
};
