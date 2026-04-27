import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb, { getMongoUriStatus } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import userRoutes from "./routes/user.routes.js";
import externalRoutes from "./routes/externalRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import itineraryRoutes from "./routes/itinerary.routes.js";
import generateItineraryRoutes from "./routes/generateItinerary.routes.js";
import placesRoutes from "./routes/places.routes.js";
import travelRoutes from "./routes/travel.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import {
  getOpenTripMapKeyPreview,
  hasOpenTripMapKey
} from "./services/opentripmap.service.js";
import {
  getGeoapifyKeyPreview,
  hasGeoapifyKey
} from "./services/geoapify.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const startupTimestamp = new Date().toISOString();
const mongoUriStatus = getMongoUriStatus();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "TripWise API running",
    startedAt: startupTimestamp,
    databaseConfigured: mongoUriStatus.ok,
    databaseConfigReason: mongoUriStatus.reason,
    openTripMapConfigured: hasOpenTripMapKey(),
    geoapifyConfigured: hasGeoapifyKey(),
    allowedOrigins: process.env.FRONTEND_URL || "*"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/destination", destinationRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api", generateItineraryRoutes);
app.use("/api", placesRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

const logStartupDebug = () => {
  console.log("TripWise startup debug", {
    startedAt: startupTimestamp,
    envPath: path.join(__dirname, ".env"),
    port: PORT,
    databaseConfigured: mongoUriStatus.ok,
    databaseConfigReason: mongoUriStatus.reason,
    openTripMapConfigured: hasOpenTripMapKey(),
    openTripMapKeyPreview: getOpenTripMapKeyPreview(),
    geoapifyConfigured: hasGeoapifyKey(),
    geoapifyKeyPreview: getGeoapifyKeyPreview(),
    allowedOrigins,
    routes: [
      "GET /",
      "GET /api/places",
      "POST /api/places",
      "POST /api/travel/route",
      "POST /api/travel/budget",
      "POST /api/travel/optimize",
      "POST /api/travel/auto-plan",
      "POST /api/travel/weather-replan",
      "GET /api/travel/weather",
      "POST /api/trips",
      "GET /api/trips",
      "GET /api/trips/:id",
      "POST /api/chat"
    ]
  });
};

connectDb()
  .then((dbStatus) => {
    if (!dbStatus.connected) {
      console.warn(`MongoDB startup warning: ${dbStatus.message}`);
      console.warn("TripWise API is running without a database connection. Auth and trip persistence routes will not work until MONGO_URI is fixed.");
    }

    return dbStatus;
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logStartupDebug();
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB", error);
    process.exit(1);
  });
