const TIME_SLOTS = ["morning", "afternoon", "evening"];
const SEVERE_WEATHER_ICONS = new Set(["rain", "drizzle", "storm", "snow", "fog"]);
const INDOOR_KEYWORDS = [
  "museum",
  "gallery",
  "temple",
  "church",
  "mosque",
  "restaurant",
  "cafe",
  "mall",
  "market",
  "theater",
  "theatre",
  "cinema",
  "library",
  "palace",
  "fort",
  "indoor",
  "shopping"
];
const OUTDOOR_KEYWORDS = [
  "park",
  "garden",
  "beach",
  "lake",
  "waterfall",
  "viewpoint",
  "hike",
  "trail",
  "zoo",
  "safari",
  "island",
  "mountain",
  "outdoor",
  "river",
  "dam"
];

const toRadians = (value) => (value * Math.PI) / 180;

export const calculateDistanceKm = (firstPlace, secondPlace) => {
  if (
    typeof firstPlace.latitude !== "number" ||
    typeof firstPlace.longitude !== "number" ||
    typeof secondPlace.latitude !== "number" ||
    typeof secondPlace.longitude !== "number"
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(secondPlace.latitude - firstPlace.latitude);
  const deltaLongitude = toRadians(secondPlace.longitude - firstPlace.longitude);
  const firstLatitude = toRadians(firstPlace.latitude);
  const secondLatitude = toRadians(secondPlace.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const optimizePlacesNearestNeighbor = (places = []) => {
  const withCoordinates = places.filter(
    (place) => typeof place.latitude === "number" && typeof place.longitude === "number"
  );
  const withoutCoordinates = places.filter(
    (place) => typeof place.latitude !== "number" || typeof place.longitude !== "number"
  );

  if (withCoordinates.length <= 1) {
    return [...withCoordinates, ...withoutCoordinates];
  }

  const remainingPlaces = [...withCoordinates];
  const optimizedPlaces = [remainingPlaces.shift()];

  while (remainingPlaces.length > 0) {
    const currentPlace = optimizedPlaces[optimizedPlaces.length - 1];
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    remainingPlaces.forEach((candidatePlace, index) => {
      const distance = calculateDistanceKm(currentPlace, candidatePlace);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    optimizedPlaces.push(remainingPlaces.splice(closestIndex, 1)[0]);
  }

  return [...optimizedPlaces, ...withoutCoordinates];
};

export const createEmptyItineraryState = (days = 1) => {
  const itinerary = {};

  for (let dayNumber = 1; dayNumber <= days; dayNumber += 1) {
    itinerary[`day${dayNumber}`] = {
      label: `Day ${dayNumber}`,
      morning: [],
      afternoon: [],
      evening: []
    };
  }

  return itinerary;
};

export const distributePlacesAcrossDays = ({ days, places, placesPerDay = 3 }) => {
  const itinerary = createEmptyItineraryState(days);
  const slotSequence = [];
  const perDayLimit = Math.max(1, Number(placesPerDay) || 3);

  for (let dayNumber = 1; dayNumber <= days; dayNumber += 1) {
    for (let placeIndex = 0; placeIndex < perDayLimit; placeIndex += 1) {
      slotSequence.push({
        dayKey: `day${dayNumber}`,
        slot: TIME_SLOTS[placeIndex % TIME_SLOTS.length]
      });
    }
  }

  places.slice(0, days * perDayLimit).forEach((place, index) => {
    const target = slotSequence[index % slotSequence.length];
    itinerary[target.dayKey][target.slot].push(place);
  });

  return itinerary;
};

export const buildSmartMultiDayItinerary = ({ days, places, placesPerDay = 3 }) => {
  const optimizedPlaces = optimizePlacesNearestNeighbor(places);

  return {
    optimizedPlaces: optimizedPlaces.slice(0, days * Math.max(1, Number(placesPerDay) || 3)),
    itinerary: distributePlacesAcrossDays({
      days,
      places: optimizedPlaces,
      placesPerDay
    })
  };
};

const getPlaceSearchText = (place = {}) =>
  [
    place.category,
    place.interest,
    place.name,
    place.description,
    place.address,
    place.type
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const classifyPlaceWeatherProfile = (place = {}) => {
  const searchText = getPlaceSearchText(place);
  const indoorScore = INDOOR_KEYWORDS.reduce(
    (count, keyword) => count + (searchText.includes(keyword) ? 1 : 0),
    0
  );
  const outdoorScore = OUTDOOR_KEYWORDS.reduce(
    (count, keyword) => count + (searchText.includes(keyword) ? 1 : 0),
    0
  );

  if (outdoorScore > indoorScore && outdoorScore > 0) {
    return "outdoor";
  }

  if (indoorScore > outdoorScore && indoorScore > 0) {
    return "indoor";
  }

  return "neutral";
};

const getDayWeatherType = (forecastDay = {}) => {
  if (
    SEVERE_WEATHER_ICONS.has(String(forecastDay.icon || "").toLowerCase()) ||
    Number(forecastDay.weatherCode) >= 80
  ) {
    return "bad";
  }

  if (String(forecastDay.icon || "").toLowerCase() === "cloudy") {
    return "neutral";
  }

  return "good";
};

const flattenItineraryForPlanning = (itinerary = {}) =>
  Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .flatMap((dayKey, dayIndex) =>
      TIME_SLOTS.flatMap((slot) =>
        (itinerary[dayKey]?.[slot] || []).map((place, index) => ({
          ...place,
          __originalDayKey: dayKey,
          __originalDayIndex: dayIndex,
          __originalSlot: slot,
          __originalSlotIndex: index,
          __weatherProfile: classifyPlaceWeatherProfile(place)
        }))
      )
    );

const buildDayCapacities = (itinerary = {}) =>
  Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .map((dayKey, index) => ({
      dayKey,
      label: itinerary[dayKey]?.label || `Day ${index + 1}`,
      index,
      slotCapacities: TIME_SLOTS.reduce((accumulator, slot) => {
        accumulator[slot] = (itinerary[dayKey]?.[slot] || []).length;
        return accumulator;
      }, {}),
      capacity: TIME_SLOTS.reduce(
        (count, slot) => count + ((itinerary[dayKey]?.[slot] || []).length),
        0
      )
    }));

const getWeatherSuitabilityScore = (weatherProfile, dayWeatherType) => {
  if (weatherProfile === "outdoor") {
    if (dayWeatherType === "good") return 0;
    if (dayWeatherType === "neutral") return 2;
    return 6;
  }

  if (weatherProfile === "indoor") {
    if (dayWeatherType === "bad") return 0;
    if (dayWeatherType === "neutral") return 1;
    return 3;
  }

  if (dayWeatherType === "bad") {
    return 2;
  }

  return 1;
};

const getPlacePriorityScore = (place, forecastByDayKey) => {
  const currentDayWeather = forecastByDayKey.get(place.__originalDayKey) || "neutral";

  if (place.__weatherProfile === "outdoor" && currentDayWeather === "bad") {
    return 0;
  }

  if (place.__weatherProfile === "indoor" && currentDayWeather === "good") {
    return 1;
  }

  if (place.__weatherProfile === "outdoor") {
    return 2;
  }

  if (place.__weatherProfile === "indoor") {
    return 3;
  }

  return 4;
};

const assignPlacesToDaysForWeather = ({ places, dayCapacities, forecast = [] }) => {
  const forecastByDayKey = new Map(
    dayCapacities.map((day, index) => [day.dayKey, getDayWeatherType(forecast[index] || {})])
  );
  const assignments = new Map(dayCapacities.map((day) => [day.dayKey, []]));
  const remainingCapacity = new Map(dayCapacities.map((day) => [day.dayKey, day.capacity]));

  const orderedPlaces = [...places].sort((firstPlace, secondPlace) => {
    const priorityDelta =
      getPlacePriorityScore(firstPlace, forecastByDayKey) -
      getPlacePriorityScore(secondPlace, forecastByDayKey);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return firstPlace.__originalDayIndex - secondPlace.__originalDayIndex;
  });

  orderedPlaces.forEach((place) => {
    const bestDay = dayCapacities.reduce((best, day) => {
      if ((remainingCapacity.get(day.dayKey) || 0) <= 0) {
        return best;
      }

      const score =
        getWeatherSuitabilityScore(place.__weatherProfile, forecastByDayKey.get(day.dayKey)) +
        Math.abs(day.index - place.__originalDayIndex) * 0.85 +
        ((day.dayKey === place.__originalDayKey) ? -0.35 : 0);

      if (!best || score < best.score) {
        return { dayKey: day.dayKey, score };
      }

      return best;
    }, null);

    const targetDayKey = bestDay?.dayKey || place.__originalDayKey;
    assignments.get(targetDayKey).push(place);
    remainingCapacity.set(targetDayKey, Math.max(0, (remainingCapacity.get(targetDayKey) || 0) - 1));
  });

  return {
    assignments,
    forecastByDayKey
  };
};

const distributeAssignedPlacesIntoSlots = ({ dayCapacities, assignments }) => {
  const itinerary = {};

  dayCapacities.forEach((day) => {
    const dayPlaces = optimizePlacesNearestNeighbor(assignments.get(day.dayKey) || []).map((place) => {
      const nextPlace = { ...place };
      delete nextPlace.__originalDayKey;
      delete nextPlace.__originalDayIndex;
      delete nextPlace.__originalSlot;
      delete nextPlace.__originalSlotIndex;
      delete nextPlace.__weatherProfile;
      return nextPlace;
    });

    itinerary[day.dayKey] = {
      label: day.label,
      morning: [],
      afternoon: [],
      evening: []
    };

    let cursor = 0;

    TIME_SLOTS.forEach((slot) => {
      const slotCapacity = day.slotCapacities[slot] || 0;
      itinerary[day.dayKey][slot] = dayPlaces.slice(cursor, cursor + slotCapacity);
      cursor += slotCapacity;
    });

    while (cursor < dayPlaces.length) {
      const fallbackSlot = TIME_SLOTS[cursor % TIME_SLOTS.length];
      itinerary[day.dayKey][fallbackSlot].push(dayPlaces[cursor]);
      cursor += 1;
    }
  });

  return itinerary;
};

const summarizeWeatherReplan = ({ originalItinerary, updatedItinerary, forecastByDayKey, forecast }) => {
  const changes = [];

  Object.keys(updatedItinerary).forEach((dayKey, index) => {
    const beforeIds = TIME_SLOTS.flatMap((slot) =>
      (originalItinerary[dayKey]?.[slot] || []).map((place) => place.id || place.name)
    );
    const afterIds = TIME_SLOTS.flatMap((slot) =>
      (updatedItinerary[dayKey]?.[slot] || []).map((place) => place.id || place.name)
    );

    if (beforeIds.join("|") !== afterIds.join("|")) {
      changes.push({
        dayKey,
        label: updatedItinerary[dayKey]?.label || `Day ${index + 1}`,
        weatherType: forecastByDayKey.get(dayKey) || "neutral",
        condition: forecast[index]?.condition || "Forecast updated"
      });
    }
  });

  return changes;
};

export const replanItineraryForWeather = ({ itinerary = {}, forecast = [] }) => {
  const dayCapacities = buildDayCapacities(itinerary);

  if (dayCapacities.length === 0) {
    return {
      itinerary,
      changes: [],
      message: "No itinerary available to replan."
    };
  }

  const places = flattenItineraryForPlanning(itinerary);

  if (places.length <= 1) {
    return {
      itinerary,
      changes: [],
      message: "Not enough stops for weather smart replan."
    };
  }

  const { assignments, forecastByDayKey } = assignPlacesToDaysForWeather({
    places,
    dayCapacities,
    forecast
  });

  const updatedItinerary = distributeAssignedPlacesIntoSlots({
    dayCapacities,
    assignments
  });

  const changes = summarizeWeatherReplan({
    originalItinerary: itinerary,
    updatedItinerary,
    forecastByDayKey,
    forecast
  });

  return {
    itinerary: updatedItinerary,
    changes,
    message:
      changes.length > 0
        ? `Weather smart replan adjusted ${changes.length} ${changes.length === 1 ? "day" : "days"}.`
        : "Current itinerary already fits the forecast."
  };
};
