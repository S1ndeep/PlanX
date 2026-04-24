import Review from "../models/Review.js";
import User from "../models/User.js";

export const createReview = async (req, res) => {
  try {
    const { placeId, rating, comment, visitType, photos } = req.body;
    
    if (!placeId || !rating || !comment) {
      return res.status(400).json({ error: "placeId, rating, and comment are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const review = new Review({
      placeId,
      userId: req.user.id,
      userName: user.name || "TripWise User",
      userAvatar: user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      rating,
      comment,
      visitType: visitType || "Other",
      photos: photos || []
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review", details: error.message });
  }
};

export const getReviewsByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const reviews = await Review.find({ placeId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(reviews);
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const getReviewSummary = async (req, res) => {
  try {
    const { placeId } = req.params;

    const summary = await Review.aggregate([
      { $match: { placeId } },
      { 
        $group: { 
          _id: "$placeId", 
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        } 
      }
    ]);

    if (summary.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    res.json({
      averageRating: Number(summary[0].averageRating.toFixed(1)),
      totalReviews: summary[0].totalReviews
    });
  } catch (error) {
    console.error("Error computing summary:", error);
    res.status(500).json({ error: "Failed to compute review summary" });
  }
};
