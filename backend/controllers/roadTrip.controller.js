import RoadTripPlan from "../models/RoadTripPlan.js";
import { buildRoadTripPlan } from "../services/roadTrip.service.js";
import { sendControllerError } from "../utils/httpError.js";

export const createRoadTripPlan = async (req, res) => {
  try {
    const { sourceCity, destinationCity, travelMode = "car", budget = 0 } = req.body || {};
    const parsedBudget = Number(budget) || 0;

    if (!sourceCity || !destinationCity) {
      return res.status(400).json({ message: "sourceCity and destinationCity are required" });
    }

    if (!["car", "bike"].includes(travelMode)) {
      return res.status(400).json({ message: "travelMode must be car or bike" });
    }

    const planPayload = await buildRoadTripPlan({
      sourceCity: String(sourceCity).trim(),
      destinationCity: String(destinationCity).trim(),
      travelMode,
      budget: parsedBudget
    });

    if (!req.user?.id) {
      return res.status(201).json({
        plan: {
          _id: null,
          sourceCity,
          destinationCity,
          travelMode,
          budget: parsedBudget,
          ...planPayload,
          saved: false
        },
        message: "Road trip generated without saving. Login again to save it to your account."
      });
    }

    const plan = await RoadTripPlan.create({
      userId: req.user.id,
      sourceCity,
      destinationCity,
      travelMode,
      budget: parsedBudget,
      ...planPayload
    });

    return res.status(201).json({ plan });
  } catch (error) {
    return sendControllerError(res, error, "Failed to generate road trip plan");
  }
};

export const getRoadTripPlans = async (req, res) => {
  try {
    const plans = await RoadTripPlan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(25);
    return res.json({ plans });
  } catch (error) {
    return sendControllerError(res, error, "Failed to fetch road trip plans");
  }
};

export const getRoadTripPlanById = async (req, res) => {
  try {
    const plan = await RoadTripPlan.findOne({ _id: req.params.id, userId: req.user.id });

    if (!plan) {
      return res.status(404).json({ message: "Road trip plan not found" });
    }

    return res.json({ plan });
  } catch (error) {
    return sendControllerError(res, error, "Failed to fetch road trip plan");
  }
};
