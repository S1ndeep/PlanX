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
import roadTripRoutes from "./routes/roadTrip.routes.js";
import groupTripRoutes from "./routes/groupTrip.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import aiTravelRoutes from "./routes/aiTravel.routes.js";
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

const parseAllowedOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...parseAllowedOrigins(process.env.FRONTEND_URL || ""),
  ...parseAllowedOrigins(process.env.FRONTEND_URLS || ""),
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

const isLocalViteOrigin = (origin = "") => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isLocalHost = ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname);
    const isVitePort = Number(parsedOrigin.port) >= 5173 && Number(parsedOrigin.port) <= 5180;
    return parsedOrigin.protocol === "http:" && isLocalHost && isVitePort;
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalViteOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
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
    allowedOrigins
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
app.use("/api/road-trips", roadTripRoutes);
app.use("/api/groups", groupTripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiTravelRoutes);

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
      "POST /api/chat",
      "POST /api/road-trips",
      "GET /api/groups",
      "POST /api/expenses",
      "POST /api/ai/itinerary"
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
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logStartupDebug();
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the existing backend process or set PORT to another value in backend/.env.`
        );
        process.exit(1);
      }

      console.error("Server startup error", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB", error);
    process.exit(1);
  });
