import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  placeId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, default: "Anonymous Traveler" },
  userAvatar: { type: String, default: "" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 300 },
  visitType: { type: String, enum: ["Solo", "Family", "Friends", "Couple", "Other"], default: "Other" },
  photos: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ placeId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
