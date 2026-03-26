import Trip from "../models/Trip.js";

export const createTrip = async (req, res) => {
  try {
    const {
      city,
      days,
      placesPerDay = 3,
      itinerary,
      interests = [],
      coordinates,
      weather = [],
      route = null
    } = req.body;

    if (!city || !days || !itinerary) {
      return res.status(400).json({ message: "city, days, and itinerary are required" });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      city,
      days,
      placesPerDay,
      itinerary,
      interests,
      coordinates,
      weather,
      route,
      isPublic: true
    });

    return res.status(201).json({
      message: "Trip saved",
      trip,
      shareUrl: `/trip/${trip._id}`
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save trip" });
  }
};

export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ trips });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trips" });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.json({ trip });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trip" });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete trip" });
  }
};
