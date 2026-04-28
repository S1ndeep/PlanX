import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import { validateReviewComment } from "../utils/reviewModeration.js";

const slotOrder = ["morning", "afternoon", "evening"];

const roundToSingleDecimal = (value) => Math.round(value * 10) / 10;

const buildUserReviewSummary = (user) => {
  if (!user) {
    return null;
  }

  const reviews = Array.isArray(user.reviews) ? user.reviews : [];
  const totalRatings = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const averageRating = reviews.length > 0 ? roundToSingleDecimal(totalRatings / reviews.length) : 0;

  return {
    id: String(user._id),
    name: user.name,
    profilePicture: user.profilePicture || null,
    reviewCount: reviews.length,
    averageRating,
    reviews: reviews
      .slice()
      .sort((firstReview, secondReview) => {
        const firstTime = new Date(firstReview.updatedAt || firstReview.createdAt || 0).getTime();
        const secondTime = new Date(secondReview.updatedAt || secondReview.createdAt || 0).getTime();
        return secondTime - firstTime;
      })
      .map((review) => ({
        id: String(review._id),
        reviewerId: String(review.reviewer),
        reviewerName: review.reviewerName,
        reviewerProfilePicture: review.reviewerProfilePicture || null,
        rating: review.rating,
        comment: review.comment || "",
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }))
  };
};

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

const buildFeaturedTripReviewCards = (trips = []) =>
  trips
    .filter((trip) => trip?.tripReview?.comment)
    .map((trip) => ({
      id: `trip-review-${trip._id}`,
      rating: trip.tripReview.rating,
      comment: trip.tripReview.comment,
      createdAt: trip.tripReview.updatedAt || trip.updatedAt || trip.createdAt,
      updatedAt: trip.tripReview.updatedAt || trip.updatedAt || trip.createdAt,
      reviewer: {
        id: trip.userId ? String(trip.userId._id || trip.userId) : `trip-owner-${trip._id}`,
        name: trip.userId?.name || "Traveler",
        profilePicture: trip.userId?.profilePicture || null
      },
      reviewFor: {
        id: String(trip._id),
        name: trip.city || "Trip",
        profilePicture: null,
        averageRating: trip.tripReview.rating,
        reviewCount: 1
      },
      sourceType: "trip",
      budgetSpent: trip.tripReview.budgetSpent ?? null
    }));

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
      budgetEstimate = null,
      status = "planned"
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
      status: status === "completed" ? "completed" : "planned",
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

export const importSharedTrip = async (req, res) => {
  try {
    const sourceTrip = await Trip.findById(req.params.id).lean();

    if (!sourceTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (String(sourceTrip.userId || "") === String(req.user.id)) {
      return res.json({
        message: "This trip is already in your account.",
        trip: sourceTrip,
        shareUrl: `/trip/${sourceTrip._id}`,
        imported: false,
        alreadyExists: true
      });
    }

    const existingImportedTrip = await Trip.findOne({
      userId: req.user.id,
      clonedFromTripId: sourceTrip._id
    });

    if (existingImportedTrip) {
      return res.json({
        message: "Trip already added to your account.",
        trip: existingImportedTrip,
        shareUrl: `/trip/${existingImportedTrip._id}`,
        imported: false,
        alreadyExists: true
      });
    }

    const importedTrip = await Trip.create({
      userId: req.user.id,
      clonedFromTripId: sourceTrip._id,
      city: sourceTrip.city,
      startLocation: sourceTrip.startLocation || "",
      destinations: Array.isArray(sourceTrip.destinations) ? sourceTrip.destinations : [],
      days: sourceTrip.days,
      placesPerDay: sourceTrip.placesPerDay || 3,
      interests: Array.isArray(sourceTrip.interests) ? sourceTrip.interests : [],
      coordinates: sourceTrip.coordinates || {},
      itinerary: sourceTrip.itinerary,
      weather: Array.isArray(sourceTrip.weather) ? sourceTrip.weather : [],
      route: sourceTrip.route || null,
      budgetEstimate: sourceTrip.budgetEstimate || null,
      status: "planned",
      isPublic: true
    });

    return res.status(201).json({
      message: "Trip added to your account.",
      trip: importedTrip,
      shareUrl: `/trip/${importedTrip._id}`,
      imported: true,
      alreadyExists: false
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to import trip" });
  }
};

export const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!["planned", "completed"].includes(status)) {
      return res.status(400).json({ message: "status must be planned or completed" });
    }

    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        $set: { status }
      },
      {
        new: true
      }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.json({
      message: status === "completed" ? "Trip marked as completed" : "Trip moved back to planned",
      trip
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update trip status" });
  }
};

export const upsertTripReview = async (req, res) => {
  try {
    const { rating, comment = "", budgetSpent = null } = req.body || {};
    const parsedRating = Number(rating);
    const moderation = validateReviewComment(comment);
    const normalizedComment = moderation.normalizedComment;
    const parsedBudgetSpent =
      budgetSpent === null || budgetSpent === undefined || budgetSpent === ""
        ? null
        : Number(budgetSpent);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }

    if (!moderation.ok) {
      return res.status(400).json({ message: moderation.message });
    }

    if (
      parsedBudgetSpent !== null &&
      (!Number.isFinite(parsedBudgetSpent) || parsedBudgetSpent < 0)
    ) {
      return res.status(400).json({ message: "budgetSpent must be a number greater than or equal to 0" });
    }

    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        $set: {
          tripReview: {
            rating: parsedRating,
            budgetSpent: parsedBudgetSpent,
            comment: normalizedComment,
            updatedAt: new Date()
          }
        }
      },
      {
        new: true
      }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.json({
      message: "Trip review saved",
      trip
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save trip review" });
  }
};

export const getFeaturedTripReviews = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit || 6);
    const limit = Math.min(Math.max(requestedLimit, 1), 12);

    const trips = await Trip.find({
      "tripReview.rating": { $gte: 1 },
      "tripReview.comment": { $exists: true, $ne: "" }
    })
      .populate("userId", "name profilePicture")
      .sort({ "tripReview.updatedAt": -1, updatedAt: -1 })
      .limit(limit * 2)
      .lean();

    const featuredReviews = buildFeaturedTripReviewCards(trips)
      .sort((firstReview, secondReview) => {
        const firstTime = new Date(firstReview.updatedAt || firstReview.createdAt || 0).getTime();
        const secondTime = new Date(secondReview.updatedAt || secondReview.createdAt || 0).getTime();
        return secondTime - firstTime;
      })
      .slice(0, limit);

    return res.json({ reviews: featuredReviews });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch featured trip reviews" });
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
    const trip = await Trip.findById(req.params.id).lean();

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const owner =
      trip.userId && mongoose.Types.ObjectId.isValid(String(trip.userId))
        ? await User.findById(trip.userId).select("name profilePicture reviews")
        : null;

    return res.json({
      trip: {
        ...trip,
        owner: buildUserReviewSummary(owner)
      }
    });
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
