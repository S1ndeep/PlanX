import axios from "axios";
import { buildRoute } from "./routing.service.js";

const GEOAPIFY_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

const knownCityCoordinates = {
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  goa: { latitude: 15.2993, longitude: 74.124 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 }
};

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const getGeoapifyApiKey = () => sanitizeApiKey(process.env.GEOAPIFY_API_KEY || "");

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineKm = (from, to) => {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const interpolateCoordinate = (from, to, ratio) => ({
  latitude: Number((from.latitude + (to.latitude - from.latitude) * ratio).toFixed(6)),
  longitude: Number((from.longitude + (to.longitude - from.longitude) * ratio).toFixed(6))
});

export const geocodeCity = async (city) => {
  const normalizedCity = String(city || "").trim();
  const fallback = knownCityCoordinates[normalizedCity.toLowerCase()];

  if (fallback) {
    return fallback;
  }

  const apiKey = getGeoapifyApiKey();
  if (!apiKey) {
    throw new Error(`Coordinates not found for ${normalizedCity}. Configure GEOAPIFY_API_KEY for global geocoding.`);
  }

  const response = await axios.get(GEOAPIFY_GEOCODE_URL, {
    params: {
      text: normalizedCity,
      limit: 1,
      apiKey
    },
    timeout: 8000
  });

  const feature = response.data.features?.[0];
  const latitude = feature?.properties?.lat;
  const longitude = feature?.properties?.lon;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error(`Coordinates not found for ${normalizedCity}`);
  }

  return { latitude, longitude };
};

const estimateFuelCost = ({ distanceKm, travelMode, fuelPricePerLiter = 105 }) => {
  const mileage = travelMode === "bike" ? 35 : 15;
  return Math.round((distanceKm / mileage) * fuelPricePerLiter);
};

const buildFallbackRoute = ({ sourceCity, destinationCity, sourceCoordinates, destinationCoordinates, travelMode }) => {
  const directDistanceKm = haversineKm(sourceCoordinates, destinationCoordinates);
  const roadDistanceKm = Number((directDistanceKm * 1.22).toFixed(1));
  const averageSpeed = travelMode === "bike" ? 52 : 62;
  const durationMinutes = Math.round((roadDistanceKm / averageSpeed) * 60);

  return {
    geometry: [
      [sourceCoordinates.latitude, sourceCoordinates.longitude],
      [destinationCoordinates.latitude, destinationCoordinates.longitude]
    ],
    distanceKm: roadDistanceKm,
    durationMinutes,
    legs: [
      {
        from: sourceCity,
        to: destinationCity,
        distanceKm: roadDistanceKm,
        durationMinutes
      }
    ]
  };
};

const buildStops = ({ sourceCoordinates, destinationCoordinates, distanceKm, durationMinutes }) => {
  const stopIntervalKm = 125;
  const stopCount = Math.max(0, Math.floor(distanceKm / stopIntervalKm));
  const stops = [];

  for (let index = 1; index <= stopCount; index += 1) {
    const distanceFromStartKm = Math.min(index * stopIntervalKm, distanceKm - 30);
    const ratio = distanceFromStartKm / distanceKm;
    const coordinates = interpolateCoordinate(sourceCoordinates, destinationCoordinates, ratio);
    const estimatedArrivalMinutes = Math.round(durationMinutes * ratio);

    stops.push({
      type: "fuel",
      name: `Fuel and stretch stop ${index}`,
      description: "Recommended refuel checkpoint based on a 100-150 km driving cadence.",
      distanceFromStartKm,
      estimatedArrivalMinutes,
      coordinates
    });

    if (index % 2 === 0) {
      stops.push({
        type: "restaurant",
        name: `Meal break near km ${Math.round(distanceFromStartKm)}`,
        description: "Plan a food stop around this segment to avoid rushed driving.",
        distanceFromStartKm: distanceFromStartKm + 8,
        estimatedArrivalMinutes: estimatedArrivalMinutes + 12,
        coordinates: interpolateCoordinate(sourceCoordinates, destinationCoordinates, Math.min(0.98, ratio + 0.02))
      });
    }

    if (index % 3 === 0) {
      stops.push({
        type: "scenic",
        name: `Scenic pause near km ${Math.round(distanceFromStartKm)}`,
        description: "Short photo and rest window for a more relaxed road trip.",
        distanceFromStartKm: distanceFromStartKm + 15,
        estimatedArrivalMinutes: estimatedArrivalMinutes + 18,
        coordinates: interpolateCoordinate(sourceCoordinates, destinationCoordinates, Math.min(0.98, ratio + 0.035))
      });
    }
  }

  return stops.sort((first, second) => first.distanceFromStartKm - second.distanceFromStartKm);
};

const buildRouteVariants = ({ baseRoute, travelMode, budget }) => {
  const fastestFuelCost = estimateFuelCost({
    distanceKm: baseRoute.distanceKm,
    travelMode
  });

  const variants = [
    {
      type: "fastest",
      label: "Fastest",
      distanceKm: baseRoute.distanceKm,
      durationMinutes: baseRoute.durationMinutes,
      fuelCost: fastestFuelCost,
      geometry: baseRoute.geometry,
      notes: ["Prioritizes shortest travel time and fewer long breaks."]
    },
    {
      type: "scenic",
      label: "Scenic",
      distanceKm: Number((baseRoute.distanceKm * 1.12).toFixed(1)),
      durationMinutes: Math.round(baseRoute.durationMinutes * 1.24),
      fuelCost: estimateFuelCost({ distanceKm: baseRoute.distanceKm * 1.12, travelMode }),
      geometry: baseRoute.geometry,
      notes: ["Adds viewpoint and attraction windows for a slower, richer drive."]
    },
    {
      type: "cheapest",
      label: "Cheapest",
      distanceKm: Number((baseRoute.distanceKm * 0.98).toFixed(1)),
      durationMinutes: Math.round(baseRoute.durationMinutes * 1.08),
      fuelCost: estimateFuelCost({ distanceKm: baseRoute.distanceKm * 0.98, travelMode, fuelPricePerLiter: 100 }),
      geometry: baseRoute.geometry,
      notes: ["Keeps fuel burn low and avoids unnecessary detours."]
    }
  ];

  return variants.map((variant) => ({
    ...variant,
    withinBudget: budget > 0 ? variant.fuelCost <= budget : true
  }));
};

const buildTimeline = ({ sourceCity, destinationCity, route, stops }) => {
  const start = {
    kind: "start",
    title: `Start from ${sourceCity}`,
    offsetMinutes: 0,
    distanceFromStartKm: 0
  };
  const stopItems = stops.map((stop) => ({
    kind: stop.type,
    title: stop.name,
    description: stop.description,
    offsetMinutes: stop.estimatedArrivalMinutes,
    distanceFromStartKm: stop.distanceFromStartKm
  }));
  const end = {
    kind: "destination",
    title: `Arrive at ${destinationCity}`,
    offsetMinutes: route.durationMinutes,
    distanceFromStartKm: route.distanceKm
  };

  return [start, ...stopItems, end].sort((first, second) => first.offsetMinutes - second.offsetMinutes);
};

export const buildRoadTripPlan = async ({ sourceCity, destinationCity, travelMode, budget }) => {
  const sourceCoordinates = await geocodeCity(sourceCity);
  const destinationCoordinates = await geocodeCity(destinationCity);
  let route;

  try {
    route = await buildRoute([
      { name: sourceCity, ...sourceCoordinates },
      { name: destinationCity, ...destinationCoordinates }
    ]);
  } catch (error) {
    route = buildFallbackRoute({
      sourceCity,
      destinationCity,
      sourceCoordinates,
      destinationCoordinates,
      travelMode
    });
  }

  if (!route.distanceKm) {
    route = buildFallbackRoute({
      sourceCity,
      destinationCity,
      sourceCoordinates,
      destinationCoordinates,
      travelMode
    });
  }

  const fuelCost = estimateFuelCost({ distanceKm: route.distanceKm, travelMode });
  const stops = buildStops({
    sourceCoordinates,
    destinationCoordinates,
    distanceKm: route.distanceKm,
    durationMinutes: route.durationMinutes
  });
  const routeVariants = buildRouteVariants({ baseRoute: route, travelMode, budget });

  return {
    sourceCoordinates,
    destinationCoordinates,
    summary: {
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      fuelCost,
      withinBudget: budget > 0 ? fuelCost <= budget : true
    },
    routeVariants,
    stops,
    timeline: buildTimeline({ sourceCity, destinationCity, route, stops })
  };
};
