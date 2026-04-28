import Expense from "../models/Expense.js";
import GroupTrip from "../models/GroupTrip.js";
import { buildEqualShares, calculateExpenseSummary, estimateDailyCostsFromItinerary } from "../services/expense.service.js";
import { sendControllerError } from "../utils/httpError.js";

const canAccessGroup = async (groupTripId, userId) => {
  if (!groupTripId) return true;
  const groupTrip = await GroupTrip.findById(groupTripId).select("members");
  return Boolean(groupTrip?.members.some((member) => String(member.userId) === String(userId)));
};

export const createExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category = "other",
      tripId = null,
      groupTripId = null,
      participants = [],
      shares = [],
      itineraryDay = null,
      notes = ""
    } = req.body || {};
    const parsedAmount = Number(amount);

    if (!title || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "title and a positive amount are required" });
    }

    if (!(await canAccessGroup(groupTripId, req.user.id))) {
      return res.status(403).json({ message: "You do not have access to this group trip" });
    }

    const normalizedParticipants = participants.length ? participants : [req.user.id];
    const normalizedShares = shares.length
      ? shares
      : buildEqualShares({ amount: parsedAmount, participants: normalizedParticipants });

    const expense = await Expense.create({
      title,
      amount: parsedAmount,
      category,
      tripId,
      groupTripId,
      participants: normalizedParticipants,
      shares: normalizedShares,
      paidBy: req.user.id,
      itineraryDay,
      notes
    });

    return res.status(201).json({ expense });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create expense");
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { tripId, groupTripId } = req.query;

    if (!(await canAccessGroup(groupTripId, req.user.id))) {
      return res.status(403).json({ message: "You do not have access to this group trip" });
    }

    const query = {};
    if (tripId) query.tripId = tripId;
    if (groupTripId) query.groupTripId = groupTripId;
    if (!tripId && !groupTripId) query.$or = [{ paidBy: req.user.id }, { participants: req.user.id }];

    const expenses = await Expense.find(query)
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      expenses,
      summary: calculateExpenseSummary(expenses)
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to fetch expenses");
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (String(expense.paidBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the payer can delete this expense" });
    }

    await expense.deleteOne();
    return res.json({ message: "Expense deleted" });
  } catch (error) {
    return sendControllerError(res, error, "Failed to delete expense");
  }
};

export const estimateItineraryCosts = async (req, res) => {
  try {
    const { days = 1, budget = 0, interests = [] } = req.body || {};
    return res.json({
      estimates: estimateDailyCostsFromItinerary({ days, budget, interests })
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to estimate itinerary costs");
  }
};
