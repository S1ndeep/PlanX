import Trip from "../models/Trip.js";

const slotOrder = ["morning", "afternoon", "evening"];

const extractDestinationsFromItinerary = (itinerary = {}) => {
  if (!itinerary || typeof itinerary !== "object") {
    return [];
  }

  const seen = new Set();
  const destinations = [];

  const addDestination = (value) => {
    const label = String(value || "").trim();

    if (!label) {
      return;
    }

    const normalized = label.toLowerCase();

    if (seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    destinations.push(label);
  };

  if (Array.isArray(itinerary)) {
    itinerary.forEach((day) => {
      (day?.slots || []).forEach((slot) => {
        addDestination(
          slot?.place?.city ||
            slot?.place?.destination ||
            slot?.place?.name ||
            slot?.place?.title ||
            slot?.place?.address
        );
      });
    });

    return destinations;
  }

  Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .forEach((dayKey) => {
      slotOrder.forEach((slot) => {
        (itinerary[dayKey]?.[slot] || []).forEach((place) => {
          addDestination(
            place?.city || place?.destination || place?.name || place?.title || place?.address
          );
        });
      });
    });

  return destinations;
};

export const createTrip = async (req, res) => {
  try {
    const {
      city,
      startLocation = "",
      destinations = [],
      days,
      placesPerDay = 3,
      itinerary,
      interests = [],
      coordinates,
      weather = [],
      route = null,
      budgetEstimate = null
    } = req.body;

    if (!city || !days || !itinerary) {
      return res.status(400).json({ message: "city, days, and itinerary are required" });
    }

    const normalizedDestinations = Array.isArray(destinations)
      ? destinations.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    const derivedDestinations =
      normalizedDestinations.length > 0
        ? normalizedDestinations
        : extractDestinationsFromItinerary(itinerary);

    const trip = await Trip.create({
      userId: req.user.id,
      city,
      startLocation: String(startLocation || "").trim(),
      destinations: derivedDestinations,
      days,
      placesPerDay,
      itinerary,
      interests,
      coordinates,
      weather,
      route,
      budgetEstimate,
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

export const updateTrip = async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;
    
    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or unauthorized to update" });
    }

    const updates = req.body;
    
    // Allow updating status, startDate, and potentially other fields in the future
    if (updates.status) trip.status = updates.status;
    if (updates.startDate) trip.startDate = updates.startDate;
    
    const updatedTrip = await trip.save();
    
    return res.json({ message: "Trip updated successfully", trip: updatedTrip });
  } catch (error) {
    console.error("Failed to update trip:", error);
    return res.status(500).json({ message: "Failed to update trip" });
  }
};
