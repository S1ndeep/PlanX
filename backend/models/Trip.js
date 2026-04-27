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
    startLocation: {
      type: String,
      default: ""
    },
    destinations: {
      type: [String],
      default: []
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
    budgetEstimate: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    status: {
      type: String,
      enum: ["planned", "completed"],
      default: "planned"
    },
    tripReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      budgetSpent: {
        type: Number,
        min: 0,
        default: null
      },
      comment: {
        type: String,
        default: "",
        trim: true
      },
      updatedAt: {
        type: Date,
        default: null
      }
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
