import mongoose from "mongoose";
import crypto from "crypto";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const voteOptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    votes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    }
  },
  { timestamps: true }
);

const groupTripSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      default: "",
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    inviteToken: {
      type: String,
      unique: true,
      index: true
    },
    members: {
      type: [memberSchema],
      default: []
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    voteOptions: {
      type: [voteOptionSchema],
      default: []
    },
    activityLog: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  { timestamps: true }
);

groupTripSchema.pre("validate", function ensureInviteToken(next) {
  if (!this.inviteToken) {
    this.inviteToken = crypto.randomBytes(16).toString("hex");
  }
  next();
});

groupTripSchema.index({ "members.userId": 1, updatedAt: -1 });

const GroupTrip = mongoose.model("GroupTrip", groupTripSchema);

export default GroupTrip;
