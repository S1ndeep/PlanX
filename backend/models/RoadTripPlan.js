import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["fuel", "restaurant", "scenic", "rest"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    distanceFromStartKm: {
      type: Number,
      min: 0,
      default: 0
    },
    estimatedArrivalMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  { _id: false }
);

const routeVariantSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["fastest", "scenic", "cheapest"],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    distanceKm: {
      type: Number,
      min: 0,
      required: true
    },
    durationMinutes: {
      type: Number,
      min: 0,
      required: true
    },
    fuelCost: {
      type: Number,
      min: 0,
      required: true
    },
    notes: {
      type: [String],
      default: []
    },
    geometry: {
      type: [[Number]],
      default: []
    }
  },
  { _id: false }
);

const roadTripPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sourceCity: {
      type: String,
      required: true,
      trim: true
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true
    },
    travelMode: {
      type: String,
      enum: ["car", "bike"],
      required: true
    },
    budget: {
      type: Number,
      min: 0,
      default: 0
    },
    sourceCoordinates: {
      latitude: Number,
      longitude: Number
    },
    destinationCoordinates: {
      latitude: Number,
      longitude: Number
    },
    summary: {
      distanceKm: Number,
      durationMinutes: Number,
      fuelCost: Number,
      withinBudget: Boolean
    },
    routeVariants: {
      type: [routeVariantSchema],
      default: []
    },
    stops: {
      type: [stopSchema],
      default: []
    },
    timeline: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  { timestamps: true }
);

roadTripPlanSchema.index({ userId: 1, createdAt: -1 });

const RoadTripPlan = mongoose.model("RoadTripPlan", roadTripPlanSchema);

export default RoadTripPlan;
