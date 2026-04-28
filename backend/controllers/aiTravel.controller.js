import Trip from "../models/Trip.js";
import { generatePersonalizedItinerary, recommendFromHistory } from "../services/aiTravel.service.js";
import { sendControllerError } from "../utils/httpError.js";

export const generateAiItinerary = async (req, res) => {
  try {
    const { destination, budget, duration, interests = [] } = req.body || {};

    if (!destination || !duration) {
      return res.status(400).json({ message: "destination and duration are required" });
    }

    const result = await generatePersonalizedItinerary({
      destination: String(destination).trim(),
      budget: Number(budget) || 0,
      duration: Number(duration),
      interests: Array.isArray(interests) ? interests : []
    });

    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, "Failed to generate AI itinerary");
  }
};

export const getTravelRecommendations = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20).lean();
    return res.json({
      recommendations: recommendFromHistory({ trips })
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to build recommendations");
  }
};
