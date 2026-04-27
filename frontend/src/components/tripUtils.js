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

export const isCompletedTrip = (trip = {}) => trip.status === "completed";

export const isDraftTrip = (trip = {}) =>
  trip.status === "draft" || (!isCompletedTrip(trip) && !trip.route?.geometry?.length);
