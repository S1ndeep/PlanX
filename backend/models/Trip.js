import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    city: {
      type: String,
      required: true
    },
    days: {
      type: Number,
      required: true
    },
    placesPerDay: {
      type: Number,
      default: 3
    },
    interests: {
      type: [String],
      default: []
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    weather: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    route: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
