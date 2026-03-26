import axios from "axios";

const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const maskApiKey = (value = "") => {
  if (!value) return "missing";
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)} (len=${value.length})`;
};

const getGeoapifyApiKey = () => sanitizeApiKey(process.env.GEOAPIFY_API_KEY || "");

export const getGeoapifyKeyPreview = () => maskApiKey(getGeoapifyApiKey());
export const hasGeoapifyKey = () => Boolean(getGeoapifyApiKey());

const inferInterest = (category = "") => {
  if (category.includes("catering.restaurant") || category.includes("catering.cafe")) {
    return "food";
  }
  if (category.includes("entertainment.museum")) {
    return "museums";
  }
  if (category.includes("leisure.park")) {
    return "parks";
  }
  return "landmarks";
};

const toFallbackImage = (placeName = "travel destination") =>
  `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(placeName)}`;

export const getFoodAndLeisurePlaces = async ({ latitude, longitude, limit = 20 }) => {
  const apiKey = getGeoapifyApiKey();

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is not configured");
  }

  const categories = [
    "catering.restaurant",
    "catering.cafe",
    "tourism.sights",
    "entertainment.museum",
    "leisure.park",
    "commercial.shopping_mall",
    "commercial.marketplace"
  ].join(",");

  console.log("Geoapify places request", {
    url: GEOAPIFY_PLACES_URL,
    latitude,
    longitude,
    categories,
    limit,
    apiKeyPreview: getGeoapifyKeyPreview()
  });

  const response = await axios.get(GEOAPIFY_PLACES_URL, {
    params: {
      categories,
      filter: `circle:${longitude},${latitude},10000`,
      bias: `proximity:${longitude},${latitude}`,
      limit,
      apiKey
    },
    timeout: 8000
  });

  const places = (response.data.features || [])
    .filter((feature) => feature?.properties?.name?.trim())
    .map((feature) => ({
      id: feature.properties.place_id,
      name: feature.properties.name.trim(),
      category: feature.properties.categories?.[0] || "place",
      interest: inferInterest(feature.properties.categories?.[0] || ""),
      type: (feature.properties.categories || []).join(",") || feature.properties.categories?.[0] || "place",
      address: feature.properties.formatted || "",
      image: toFallbackImage(feature.properties.name.trim()),
      latitude: feature.properties.lat ?? null,
      longitude: feature.properties.lon ?? null
    }));

  console.log("Geoapify places fetched", {
    count: places.length
  });

  return places;
};
