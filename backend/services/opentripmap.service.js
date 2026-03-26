import axios from "axios";

const OPENTRIPMAP_GEONAME_URL = "https://api.opentripmap.com/0.1/en/places/geoname";
const OPENTRIPMAP_RADIUS_URL = "https://api.opentripmap.com/0.1/en/places/radius";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const maskApiKey = (value = "") => {
  if (!value) return "missing";
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)} (len=${value.length})`;
};

const getOpenTripMapApiKey = () => sanitizeApiKey(process.env.OPENTRIPMAP_API_KEY || "");

export const getOpenTripMapKeyPreview = () => maskApiKey(getOpenTripMapApiKey());
export const hasOpenTripMapKey = () => Boolean(getOpenTripMapApiKey());

export const getCityCoordinates = async (city) => {
  const apiKey = getOpenTripMapApiKey();

  if (!apiKey) {
    throw new Error("OPENTRIPMAP_API_KEY is not configured");
  }

  console.log("OpenTripMap geoname request", {
    url: OPENTRIPMAP_GEONAME_URL,
    city,
    apiKeyPreview: getOpenTripMapKeyPreview()
  });

  const response = await axios.get(OPENTRIPMAP_GEONAME_URL, {
    params: {
      name: city,
      apikey: apiKey
    },
    timeout: 8000
  });

  const latitude = response.data.lat;
  const longitude = response.data.lon;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error(`Coordinates not found for city: ${city}`);
  }

  console.log("OpenTripMap coordinates fetched", {
    city,
    latitude,
    longitude
  });

  return { latitude, longitude };
};

export const getNearbyAttractions = async ({ latitude, longitude, radius = 10000, limit = 20 }) => {
  const apiKey = getOpenTripMapApiKey();

  if (!apiKey) {
    throw new Error("OPENTRIPMAP_API_KEY is not configured");
  }

  console.log("OpenTripMap radius request", {
    url: OPENTRIPMAP_RADIUS_URL,
    latitude,
    longitude,
    radius,
    limit
  });

  const response = await axios.get(OPENTRIPMAP_RADIUS_URL, {
    params: {
      radius,
      lon: longitude,
      lat: latitude,
      limit,
      rate: 2,
      format: "json",
      apikey: apiKey
    },
    timeout: 8000
  });

  const attractions = (response.data || [])
    .filter((item) => item.name)
    .map((item) => ({
      id: item.xid,
      name: item.name,
      category: "Attraction",
      interest: "landmarks",
      type: item.kinds || "interesting_place",
      address: "",
      latitude: item.point?.lat ?? item.lat ?? null,
      longitude: item.point?.lon ?? item.lon ?? null
    }));

  console.log("OpenTripMap attractions fetched", {
    count: attractions.length
  });

  return attractions;
};
