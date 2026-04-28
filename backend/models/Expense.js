import mongoose from "mongoose";

const expenseShareSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
      index: true
    },
    groupTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupTrip",
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["transport", "stay", "food", "activity", "fuel", "shopping", "other"],
      default: "other"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR",
      trim: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    shares: {
      type: [expenseShareSchema],
      default: []
    },
    itineraryDay: {
      type: Number,
      default: null
    },
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

expenseSchema.index({ groupTripId: 1, createdAt: -1 });
expenseSchema.index({ tripId: 1, createdAt: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
