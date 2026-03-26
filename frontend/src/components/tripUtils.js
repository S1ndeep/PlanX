const slotOrder = ["morning", "afternoon", "evening"];

const fallbackCityImages = {
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
  jaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
  manali: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80",
  udaipur: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
  rishikesh: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80"
};

export const countTripPlaces = (trip = {}) => {
  const itinerary = trip.itinerary || {};

  if (Array.isArray(itinerary)) {
    return itinerary.reduce(
      (count, day) => count + (day.slots || []).filter((slot) => slot.place).length,
      0
    );
  }

  return Object.values(itinerary).reduce(
    (count, day) =>
      count +
      slotOrder.reduce((slotCount, slot) => slotCount + ((day?.[slot] || []).length), 0),
    0
  );
};

export const flattenTripPlaces = (trip = {}) => {
  const itinerary = trip.itinerary || {};

  if (Array.isArray(itinerary)) {
    return itinerary.flatMap((day) => (day.slots || []).map((slot) => slot.place).filter(Boolean));
  }

  return Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .flatMap((dayKey) => slotOrder.flatMap((slot) => itinerary[dayKey]?.[slot] || []));
};

const normalizeDestinationLabel = (place = {}) => {
  if (typeof place === "string") {
    return place.trim();
  }

  const primaryLabel =
    place?.city ||
    place?.destination ||
    place?.name ||
    place?.title ||
    place?.address;

  return typeof primaryLabel === "string" ? primaryLabel.trim() : "";
};

export const getTripDestinations = (trip = {}) => {
  const explicitDestinations = Array.isArray(trip.destinations)
    ? trip.destinations.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (explicitDestinations.length > 0) {
    return explicitDestinations;
  }

  const derivedDestinations = flattenTripPlaces(trip)
    .map(normalizeDestinationLabel)
    .filter(Boolean);

  return derivedDestinations.filter(
    (destination, index, list) =>
      index === list.findIndex((item) => item.toLowerCase() === destination.toLowerCase())
  );
};

export const generateDirectionsUrl = (trip = {}, options = {}) => {
  const destinations = getTripDestinations(trip);

  if (destinations.length === 0) {
    return null;
  }

  const useCurrentLocation = Boolean(options.useCurrentLocation);
  const encodedStops = destinations.map((stop) => encodeURIComponent(stop));

  if (!useCurrentLocation && trip.startLocation) {
    return `https://www.google.com/maps/dir/${encodeURIComponent(
      trip.startLocation
    )}/${encodedStops.join("/")}`;
  }

  return `https://www.google.com/maps/dir/${encodedStops.join("/")}`;
};

export const splitDestinations = (destinations = [], days = 1) => {
  const normalizedDestinations = Array.isArray(destinations)
    ? destinations.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const parsedDays = Math.max(1, Number(days) || 1);

  if (normalizedDestinations.length === 0) {
    return [];
  }

  const result = [];
  const baseCount = Math.floor(normalizedDestinations.length / parsedDays);
  const remainder = normalizedDestinations.length % parsedDays;
  let currentIndex = 0;

  for (let index = 0; index < parsedDays; index += 1) {
    const itemsForDay = baseCount + (index < remainder ? 1 : 0);
    const dayStops = normalizedDestinations.slice(currentIndex, currentIndex + itemsForDay);

    if (dayStops.length > 0) {
      result.push(dayStops);
    }

    currentIndex += itemsForDay;
  }

  return result;
};

export const generateDayWiseUrls = (
  destinations = [],
  days = 1,
  startLocation = "",
  options = {}
) => {
  const dayGroups = splitDestinations(destinations, days);
  const useCurrentLocation = Boolean(options.useCurrentLocation);

  return dayGroups.map((stops, index) => {
    const previousLastStop = index > 0 ? dayGroups[index - 1]?.slice(-1)[0] : "";
    const pathStops =
      index === 0
        ? [useCurrentLocation ? "" : startLocation, ...stops].filter(Boolean)
        : [previousLastStop, ...stops].filter(Boolean);

    return {
      dayNumber: index + 1,
      stops,
      url: `https://www.google.com/maps/dir/${pathStops
        .map((stop) => encodeURIComponent(stop))
        .join("/")}`
    };
  });
};

export const getDayWiseDirections = (trip = {}, options = {}) =>
  generateDayWiseUrls(getTripDestinations(trip), trip.days, trip.startLocation, options);

export const buildTripDays = (trip = {}) => {
  const itinerary = trip.itinerary || {};

  if (Array.isArray(itinerary)) {
    return itinerary.map((day, index) => ({
      dayKey: `day${day.day || index + 1}`,
      label: `Day ${day.day || index + 1}`,
      morning: (day.slots || [])
        .filter((slot) => slot.timeOfDay === "Morning" && slot.place)
        .map((slot) => slot.place),
      afternoon: (day.slots || [])
        .filter((slot) => slot.timeOfDay === "Afternoon" && slot.place)
        .map((slot) => slot.place),
      evening: (day.slots || [])
        .filter((slot) => slot.timeOfDay === "Evening" && slot.place)
        .map((slot) => slot.place)
    }));
  }

  return Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .map((dayKey, index) => ({
      dayKey,
      label: itinerary[dayKey]?.label || `Day ${index + 1}`,
      morning: itinerary[dayKey]?.morning || [],
      afternoon: itinerary[dayKey]?.afternoon || [],
      evening: itinerary[dayKey]?.evening || []
    }));
};

export const getTripStartDate = (trip = {}) => {
  if (trip.startDate) {
    return new Date(trip.startDate);
  }

  const createdDate = trip.createdAt ? new Date(trip.createdAt) : new Date();
  const fallbackDate = new Date(createdDate);
  fallbackDate.setDate(createdDate.getDate() + 14);
  return fallbackDate;
};

export const getTripImage = (trip = {}) => {
  const places = flattenTripPlaces(trip);
  const firstImage = places.find((place) => place?.preview?.source || place?.image);

  if (firstImage) {
    return firstImage.preview?.source || firstImage.image;
  }

  const cityKey = String(trip.city || "").trim().toLowerCase();

  if (fallbackCityImages[cityKey]) {
    return fallbackCityImages[cityKey];
  }

  return `https://source.unsplash.com/featured/900x600/?${encodeURIComponent(trip.city || "travel")}`;
};

export const isDraftTrip = (trip = {}) => trip.status === "draft" || !trip.route?.geometry?.length;
