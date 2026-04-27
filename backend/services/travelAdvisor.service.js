import axios from "axios";

const TRAVEL_ADVISOR_SEARCH_URL = "https://travel-advisor.p.rapidapi.com/locations/search";
const TRAVEL_ADVISOR_ATTRACTIONS_URL = "https://travel-advisor.p.rapidapi.com/attractions/list";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const getTravelAdvisorApiKey = () => sanitizeApiKey(process.env.TRAVELADVISOR_API_KEY || "");

const createTravelAdvisorHeaders = () => ({
  "X-RapidAPI-Key": getTravelAdvisorApiKey(),
  "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com"
});

const parseCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toFallbackImage = (placeName = "travel destination") =>
  `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(placeName)}`;

const mapAttraction = (place = {}, index = 0) => ({
  id: place.location_id || place.locationId || `${place.name || "attraction"}-${index}`,
  name: place.name?.trim() || "",
  rating: place.rating || "N/A",
  image: place.photo?.images?.large?.url || place.photo?.images?.medium?.url || toFallbackImage(place.name),
  address: place.address_obj?.address_string || place.address || "Address not available",
  description: place.description || "",
  category: place.subcategory?.[0]?.name || "attraction",
  interest: "landmarks",
  type: place.subcategory?.[0]?.key || place.subcategory?.[0]?.name || "attraction",
  latitude: parseCoordinate(place.latitude),
  longitude: parseCoordinate(place.longitude)
});

export const hasTravelAdvisorKey = () => Boolean(getTravelAdvisorApiKey());

export const getTopCityAttractions = async (cityName, limit = 6) => {
  const apiKey = getTravelAdvisorApiKey();

  if (!apiKey) {
    return [];
  }

  const locationSearchResponse = await axios.get(TRAVEL_ADVISOR_SEARCH_URL, {
    params: {
      query: cityName,
      limit: 1,
      offset: 0,
      units: "km",
      location_id: "1",
      currency: "USD",
      sort: "relevance",
      lang: "en_US"
    },
    headers: createTravelAdvisorHeaders(),
    timeout: 5000
  });

  const locationId = locationSearchResponse.data?.data?.[0]?.result_object?.location_id;

  if (!locationId) {
    return [];
  }

  const attractionsResponse = await axios.get(TRAVEL_ADVISOR_ATTRACTIONS_URL, {
    params: {
      location_id: locationId,
      currency: "USD",
      lang: "en_US",
      lunit: "km",
      sort: "recommended"
    },
    headers: createTravelAdvisorHeaders(),
    timeout: 5000
  });

  return (attractionsResponse.data?.data || [])
    .filter((place) => place?.name?.trim())
    .slice(0, limit)
    .map(mapAttraction);
};
