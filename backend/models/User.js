import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    googleId: {
      type: String,
      default: null,
      index: true
    },
    profilePicture: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const User = mongoose.model("User", userSchema);

export default User;
