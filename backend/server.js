import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import tripRoutes from "./routes/trip.routes.js";
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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "TripWise API running",
    startedAt: startupTimestamp,
    openTripMapConfigured: hasOpenTripMapKey(),
    geoapifyConfigured: hasGeoapifyKey()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
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
    openTripMapConfigured: hasOpenTripMapKey(),
    openTripMapKeyPreview: getOpenTripMapKeyPreview(),
    geoapifyConfigured: hasGeoapifyKey(),
    geoapifyKeyPreview: getGeoapifyKeyPreview(),
    routes: [
      "GET /",
      "GET /api/places",
      "POST /api/places",
      "POST /api/travel/route",
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
