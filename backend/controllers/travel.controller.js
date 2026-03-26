import { buildRoute } from "../services/routing.service.js";
import { getBudgetEstimate } from "../services/budget.service.js";
import { getDailyForecast } from "../services/weather.service.js";
import {
  buildSmartMultiDayItinerary,
  optimizePlacesNearestNeighbor,
  replanItineraryForWeather
} from "../services/planner.service.js";

export const getRoutePreview = async (req, res) => {
  try {
    const { places = [] } = req.body;
    const route = await buildRoute(places);
    return res.json(route);
  } catch (error) {
    console.error("Route preview error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null
    });

    return res.status(error.response?.status || 500).json({
      message: "Failed to build route preview",
      details: error.response?.data || error.message
    });
  }
};

export const getWeatherForecast = async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const days = Number(req.query.days || 3);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }

    const forecast = await getDailyForecast({ latitude, longitude, days });
    return res.json({ forecast });
  } catch (error) {
    console.error("Weather forecast error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null
    });

    return res.status(error.response?.status || 500).json({
      message: "Failed to fetch forecast",
      details: error.response?.data || error.message
    });
  }
};

export const optimizeRouteOrder = async (req, res) => {
  try {
    const { places = [] } = req.body;
    const optimizedPlaces = optimizePlacesNearestNeighbor(places);
    return res.json({ places: optimizedPlaces });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to optimize route",
      details: error.message
    });
  }
};

export const autoPlanTrip = async (req, res) => {
  try {
    const { days, places = [], placesPerDay = 3 } = req.body;
    const parsedDays = Number(days);
    const parsedPlacesPerDay = Number(placesPerDay);

    if (!parsedDays) {
      return res.status(400).json({ message: "days is required" });
    }

    const result = buildSmartMultiDayItinerary({
      days: parsedDays,
      places,
      placesPerDay: parsedPlacesPerDay
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to auto plan trip",
      details: error.message
    });
  }
};

export const weatherSmartReplan = async (req, res) => {
  try {
    const { itinerary = {}, forecast = [] } = req.body;

    if (!itinerary || typeof itinerary !== "object" || Array.isArray(itinerary)) {
      return res.status(400).json({ message: "itinerary is required" });
    }

    if (!Array.isArray(forecast)) {
      return res.status(400).json({ message: "forecast must be an array" });
    }

    const result = replanItineraryForWeather({ itinerary, forecast });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to weather-smart replan trip",
      details: error.message
    });
  }
};

export const getTripBudget = async (req, res) => {
  try {
    const {
      city = "",
      days,
      dates = "",
      totalPlaces,
      placesPerDay,
      itinerarySummary = "",
      destinations = []
    } = req.body || {};

    const parsedDays = Number(days);

    if (!city || !parsedDays) {
      return res.status(400).json({
        message: "city and days are required"
      });
    }

    const budgetEstimate = await getBudgetEstimate({
      city,
      days: parsedDays,
      dates,
      totalPlaces,
      placesPerDay,
      itinerarySummary,
      destinations
    });

    return res.json({ budgetEstimate });
  } catch (error) {
    console.error("Trip budget error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null
    });

    return res.status(error.response?.status || 500).json({
      message: "Failed to generate trip budget",
      details: error.response?.data || error.message
    });
  }
};
