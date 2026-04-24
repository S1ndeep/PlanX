import mongoose from "mongoose";

const PLACEHOLDER_MONGO_URIS = new Set([
  "",
  "your_mongodb_connection_string"
]);

export const getMongoUriStatus = () => {
  const mongoUri = (process.env.MONGO_URI || "").trim();

  if (!mongoUri) {
    return {
      ok: false,
      reason: "missing",
      message: "MONGO_URI is not defined in environment variables"
    };
  }

  if (PLACEHOLDER_MONGO_URIS.has(mongoUri)) {
    return {
      ok: false,
      reason: "placeholder",
      message: "MONGO_URI is still using the example placeholder value"
    };
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    return {
      ok: false,
      reason: "invalid",
      message: 'MONGO_URI must start with "mongodb://" or "mongodb+srv://"'
    };
  }

  return {
    ok: true,
    reason: "valid",
    message: "MongoDB connection string looks valid",
    value: mongoUri
  };
};

const connectDb = async () => {
  const mongoUriStatus = getMongoUriStatus();

  if (!mongoUriStatus.ok) {
    return {
      connected: false,
      skipped: true,
      reason: mongoUriStatus.reason,
      message: mongoUriStatus.message
    };
  }

  await mongoose.connect(mongoUriStatus.value, {
    autoIndex: true
  });

  return {
    connected: true,
    skipped: false,
    reason: "connected",
    message: "MongoDB connected"
  };
};

export default connectDb;
