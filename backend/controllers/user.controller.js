import User from "../models/User.js";

const MIN_REVIEW_LENGTH = 3;

const roundToSingleDecimal = (value) => Math.round(value * 10) / 10;

const buildPublicUserProfile = (user) => {
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

const buildFeaturedReviewCards = (users = []) =>
  users.flatMap((user) => {
    const publicProfile = buildPublicUserProfile(user);

    return publicProfile.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: {
        id: review.reviewerId,
        name: review.reviewerName,
        profilePicture: review.reviewerProfilePicture
      },
      reviewFor: {
        id: publicProfile.id,
        name: publicProfile.name,
        profilePicture: publicProfile.profilePicture,
        averageRating: publicProfile.averageRating,
        reviewCount: publicProfile.reviewCount
      }
    }));
  });

export const getFeaturedReviews = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit || 6);
    const limit = Math.min(Math.max(requestedLimit, 1), 12);
    const users = await User.find({
      "reviews.0": { $exists: true }
    }).select("name profilePicture reviews");

    const featuredReviews = buildFeaturedReviewCards(users)
      .filter((review) => review.comment)
      .sort((firstReview, secondReview) => {
        const firstTime = new Date(firstReview.updatedAt || firstReview.createdAt || 0).getTime();
        const secondTime = new Date(secondReview.updatedAt || secondReview.createdAt || 0).getTime();
        return secondTime - firstTime;
      })
      .slice(0, limit);

    return res.json({ reviews: featuredReviews });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch featured reviews" });
  }
};

export const getPublicUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name profilePicture reviews");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: buildPublicUserProfile(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

export const upsertUserReview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating, comment = "" } = req.body || {};
    const parsedRating = Number(rating);
    const normalizedComment = String(comment || "").trim();

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }

    if (normalizedComment && normalizedComment.length < MIN_REVIEW_LENGTH) {
      return res.status(400).json({
        message: `comment must be at least ${MIN_REVIEW_LENGTH} characters when provided`
      });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ message: "You cannot review your own profile" });
    }

    const [targetUser, reviewer] = await Promise.all([
      User.findById(userId),
      User.findById(req.user.id).select("name profilePicture")
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!reviewer) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const existingReview = targetUser.reviews.find(
      (review) => String(review.reviewer) === String(req.user.id)
    );

    if (existingReview) {
      existingReview.rating = parsedRating;
      existingReview.comment = normalizedComment;
      existingReview.reviewerName = reviewer.name;
      existingReview.reviewerProfilePicture = reviewer.profilePicture || null;
    } else {
      targetUser.reviews.push({
        reviewer: reviewer._id,
        reviewerName: reviewer.name,
        reviewerProfilePicture: reviewer.profilePicture || null,
        rating: parsedRating,
        comment: normalizedComment
      });
    }

    await targetUser.save();

    return res.status(200).json({
      message: existingReview ? "Review updated" : "Review submitted",
      user: buildPublicUserProfile(targetUser)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save review" });
  }
};
