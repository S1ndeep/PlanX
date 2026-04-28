import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const guestId = req.headers["x-tripwise-guest-id"];

  if (!token) {
    if (mongoose.Types.ObjectId.isValid(guestId)) {
      req.user = { id: guestId, isGuest: true };
    }

    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
  } catch {
    const guestId = req.headers["x-tripwise-guest-id"];
    req.user = mongoose.Types.ObjectId.isValid(guestId)
      ? { id: guestId, isGuest: true }
      : null;
  }

  return next();
};

export default optionalAuthMiddleware;
