import {
  getCityCoordinates,
  getNearbyAttractions,
  getOpenTripMapKeyPreview
} from "../services/opentripmap.service.js";
import { getFoodAndLeisurePlaces, getGeoapifyKeyPreview } from "../services/geoapify.service.js";
import { getTopCityAttractions } from "../services/travelAdvisor.service.js";
import { buildSmartMultiDayItinerary, distributePlacesAcrossDays } from "../services/planner.service.js";

const getCategoryText = (place = {}) =>
  [place.category, place.type]
    .filter(Boolean)
    .join(",")
    .toLowerCase();

const getSearchText = (place = {}) =>
  [place.name, place.category, place.type, place.description, place.address]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isFoodLikePlace = (place = {}) => {
  const searchText = getSearchText(place);
  return (
    searchText.includes("restaurant") ||
    searchText.includes("cafe") ||
    searchText.includes("food") ||
    searchText.includes("dining") ||
    searchText.includes("bakery")
  );
};

const isMuseumLikePlace = (place = {}) => {
  const searchText = getSearchText(place);
  return (
    searchText.includes("museum") ||
    searchText.includes("gallery") ||
    searchText.includes("art ") ||
    searchText.includes("history")
  );
};

const isParkLikePlace = (place = {}) => {
  const searchText = getSearchText(place);
  return (
    searchText.includes("park") ||
    searchText.includes("garden") ||
    searchText.includes("island") ||
    searchText.includes("lake") ||
    searchText.includes("riverfront")
  );
};

const isShoppingLikePlace = (place = {}) => {
  const searchText = getSearchText(place);
  return (
    searchText.includes("market") ||
    searchText.includes("mall") ||
    searchText.includes("bazaar") ||
    searchText.includes("shopping")
  );
};

const inferInterestForPlace = (place = {}) => {
  if (isFoodLikePlace(place)) return "food";
  if (isMuseumLikePlace(place)) return "museums";
  if (isParkLikePlace(place)) return "parks";
  if (isShoppingLikePlace(place)) return "shopping";
  return "landmarks";
};

const normalizePlaceName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const dedupePlaces = (places = []) => {
  const seen = new Map();

  for (const place of places) {
    const normalizedName = normalizePlaceName(place.name || "");
    const latitude = typeof place.latitude === "number" ? place.latitude.toFixed(3) : "";
    const longitude = typeof place.longitude === "number" ? place.longitude.toFixed(3) : "";
    const locationKey = latitude && longitude ? `${latitude}:${longitude}` : "";
    const dedupeKey = `${normalizedName}|${locationKey}`;

    if (!normalizedName) {
      continue;
    }

    if (!seen.has(dedupeKey)) {
      seen.set(dedupeKey, {
        ...place,
        interest: place.interest || inferInterestForPlace(place)
      });
    }
  }

  return Array.from(seen.values());
};

const getInterestFlags = (normalizedInterests) => ({
  requestedFood: normalizedInterests.some(
    (interest) => interest.includes("food") || interest.includes("restaurant") || interest.includes("cafe")
  ),
  requestedLandmarks: normalizedInterests.some(
    (interest) => interest.includes("landmark") || interest.includes("sight") || interest.includes("attraction")
  ),
  requestedParks: normalizedInterests.some((interest) => interest.includes("park")),
  requestedMuseums: normalizedInterests.some((interest) => interest.includes("museum")),
  requestedShopping: normalizedInterests.some(
    (interest) => interest.includes("shopping") || interest.includes("market") || interest.includes("mall")
  )
});

const filterGeoapifyPlacesByInterests = (geoapifyPlaces, normalizedInterests) => {
  const {
    requestedFood,
    requestedLandmarks,
    requestedParks,
    requestedMuseums,
    requestedShopping
  } = getInterestFlags(normalizedInterests);

  return geoapifyPlaces.filter((place) => {
    const categoryText = getCategoryText(place);

    if (
      requestedFood &&
      (categoryText.includes("catering.restaurant") || categoryText.includes("catering.cafe"))
    ) {
      return true;
    }
    if (requestedParks && place.interest === "parks") {
      return true;
    }
    if (requestedMuseums && place.interest === "museums") {
      return true;
    }
    if (requestedShopping && place.interest === "shopping") {
      return true;
    }
    if (requestedLandmarks && place.interest === "landmarks") {
      return true;
    }

    return normalizedInterests.length === 0;
  });
};

const filterTopAttractionsByInterests = (topAttractions, normalizedInterests) => {
  if (normalizedInterests.length === 0) {
    return topAttractions;
  }

  const selectedInterests = new Set(normalizedInterests);

  return topAttractions
    .map((place) => ({
      ...place,
      interest: place.interest || inferInterestForPlace(place)
    }))
    .filter((place) => selectedInterests.has(place.interest));
};

const getRestaurants = (geoapifyPlaces) =>
  geoapifyPlaces.filter((place) => {
    const categoryText = getCategoryText(place);
    return (
      categoryText.includes("catering.restaurant") ||
      categoryText.includes("catering.cafe") ||
      place.interest === "food"
    );
  });

const getTopAttractionsForCity = async (city, coordinates, limit) => {
  const [travelAdvisorResult, openTripMapResult] = await Promise.allSettled([
    getTopCityAttractions(city, limit),
    getNearbyAttractions({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      limit
    })
  ]);

  const travelAdvisorPlaces =
    travelAdvisorResult.status === "fulfilled" ? travelAdvisorResult.value : [];
  const openTripMapPlaces =
    openTripMapResult.status === "fulfilled" ? openTripMapResult.value : [];

  return dedupePlaces([...travelAdvisorPlaces, ...openTripMapPlaces]);
};

export const searchPlaces = async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();

    if (!city) {
      return res.status(400).json({ message: "city query parameter is required" });
    }

    const coordinates = await getCityCoordinates(city);
    const [attractions, geoapifyPlaces] = await Promise.all([
      getTopAttractionsForCity(city, coordinates, 12),
      getFoodAndLeisurePlaces({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        limit: 20
      })
    ]);

    return res.json({
      city,
      coordinates,
      attractions,
      restaurants: dedupePlaces(getRestaurants(geoapifyPlaces))
    });
  } catch (error) {
    console.error("Places aggregation error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null,
      openTripMapKeyPreview: getOpenTripMapKeyPreview(),
      geoapifyKeyPreview: getGeoapifyKeyPreview()
    });

    return res.status(error.response?.status || 500).json({
      message: "Failed to fetch travel data",
      details: error.response?.data || error.message
    });
  }
};

export const getPlacesItinerary = async (req, res) => {
  try {
    const { city, days, interests = [], placesPerDay = 3, selectedAttractions = [] } = req.body;
    const parsedDays = Number(days);
    const parsedPlacesPerDay = Number(placesPerDay);

    if (!city || !parsedDays) {
      return res.status(400).json({ message: "city and days are required" });
    }

    const normalizedInterests = Array.isArray(interests)
      ? interests.map((interest) => String(interest).toLowerCase().trim())
      : [];

    const coordinates = await getCityCoordinates(city);
    const [rawTopAttractions, geoapifyPlaces] = await Promise.all([
      getTopAttractionsForCity(city, coordinates, Math.max(12, parsedDays * parsedPlacesPerDay)),
      getFoodAndLeisurePlaces({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        limit: 30
      })
    ]);

    const preferredAttractions = dedupePlaces(
      Array.isArray(selectedAttractions)
        ? selectedAttractions.map((place) => ({
            ...place,
            category: place.category || "attraction",
            interest: place.interest || "landmarks"
          }))
        : []
    );
    const topAttractions = filterTopAttractionsByInterests(rawTopAttractions, normalizedInterests);
    const interestDrivenPlaces = filterGeoapifyPlacesByInterests(geoapifyPlaces, normalizedInterests);
    const mixedPlaces = dedupePlaces([
      ...preferredAttractions,
      ...topAttractions,
      ...interestDrivenPlaces
    ]);

    const { itinerary, optimizedPlaces } = buildSmartMultiDayItinerary({
      days: parsedDays,
      places: mixedPlaces,
      placesPerDay: parsedPlacesPerDay
    });
    const prioritizedPlaces = dedupePlaces([
      ...preferredAttractions,
      ...optimizedPlaces
    ]).slice(0, parsedDays * parsedPlacesPerDay);
    const finalItinerary =
      preferredAttractions.length > 0
        ? distributePlacesAcrossDays({
            days: parsedDays,
            places: prioritizedPlaces,
            placesPerDay: parsedPlacesPerDay
          })
        : itinerary;

    return res.json({
      city,
      days: parsedDays,
      placesPerDay: parsedPlacesPerDay,
      interests: normalizedInterests,
      coordinates,
      selectedAttractions: preferredAttractions,
      attractions: dedupePlaces([...preferredAttractions, ...topAttractions]),
      restaurants: dedupePlaces(getRestaurants(geoapifyPlaces)),
      places: preferredAttractions.length > 0 ? prioritizedPlaces : dedupePlaces(optimizedPlaces),
      itinerary: finalItinerary
    });
  } catch (error) {
    console.error("Trip planning aggregation error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null,
      openTripMapKeyPreview: getOpenTripMapKeyPreview(),
      geoapifyKeyPreview: getGeoapifyKeyPreview()
    });

    return res.status(500).json({
      message: "Failed to generate itinerary",
      details: error.response?.data || error.message
    });
  }
};
