import axios from "axios";

const GEOAPIFY_ROUTING_URL = "https://api.geoapify.com/v1/routing";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const maskApiKey = (value = "") => {
  if (!value) return "missing";
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)} (len=${value.length})`;
};

const getGeoapifyApiKey = () => sanitizeApiKey(process.env.GEOAPIFY_API_KEY || "");

export const getGeoapifyRoutingKeyPreview = () => maskApiKey(getGeoapifyApiKey());

const toCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePlaceCoordinates = (place = {}) => {
  const latitude = toCoordinate(
    place.latitude ?? place.lat ?? place.coordinates?.latitude ?? place.coordinates?.lat
  );
  const longitude = toCoordinate(
    place.longitude ?? place.lon ?? place.lng ?? place.coordinates?.longitude ?? place.coordinates?.lon
  );

  return {
    ...place,
    latitude,
    longitude
  };
};

export const buildRoute = async (places = []) => {
  const apiKey = getGeoapifyApiKey();

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is not configured");
  }

  const normalizedPlaces = places.map(normalizePlaceCoordinates);
  const validPlaces = normalizedPlaces.filter(
    (place) => typeof place.latitude === "number" && typeof place.longitude === "number"
  );

  if (validPlaces.length < 2) {
    console.warn("Geoapify routing skipped due to insufficient valid coordinates", {
      totalPlaces: places.length,
      validPlaces: validPlaces.length,
      placePreview: normalizedPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude
      }))
    });

    return {
      geometry: [],
      distanceKm: 0,
      durationMinutes: 0,
      legs: []
    };
  }

  const waypoints = validPlaces
    .map((place) => `${place.longitude},${place.latitude}`)
    .join("|");

  console.log("Geoapify routing request", {
    url: GEOAPIFY_ROUTING_URL,
    waypointCount: validPlaces.length,
    waypoints,
    apiKeyPreview: getGeoapifyRoutingKeyPreview()
  });

  const response = await axios.get(GEOAPIFY_ROUTING_URL, {
    params: {
      waypoints,
      mode: "drive",
      details: "instruction_details",
      apiKey
    },
    timeout: 12000
  });

  const feature = response.data.features?.[0];
  const coordinates = feature?.geometry?.coordinates || [];
  const properties = feature?.properties || {};
  const legs = (properties.legs || []).map((leg, index) => ({
    fromId: validPlaces[index]?.id || `stop-${index + 1}`,
    from: validPlaces[index]?.name || `Stop ${index + 1}`,
    toId: validPlaces[index + 1]?.id || `stop-${index + 2}`,
    to: validPlaces[index + 1]?.name || `Stop ${index + 2}`,
    distanceKm: Number(((leg.distance || 0) / 1000).toFixed(1)),
    durationMinutes: Math.round((leg.time || 0) / 60)
  }));

  return {
    geometry: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceKm: Number(((properties.distance || 0) / 1000).toFixed(1)),
    durationMinutes: Math.round((properties.time || 0) / 60),
    legs
  };
};
