const STORAGE_KEY = "tripwise-local-drafts";

const createDraftId = (city = "") =>
  `local-draft-${String(city)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "trip"}`;

const buildEmptyItinerary = () => ({
  day1: {
    label: "Day 1",
    morning: [],
    afternoon: [],
    evening: []
  }
});

const safeParseDrafts = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const saveDrafts = (drafts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
};

export const loadLocalDraftTrips = () => safeParseDrafts();

export const saveLocalDraftTrips = (drafts) => saveDrafts(drafts);

export const addPlaceToLocalDraftTrip = (city, place) => {
  const normalizedCity = String(city || "").trim();
  if (!normalizedCity || !place) {
    return [];
  }

  const drafts = safeParseDrafts();
  const draftId = createDraftId(normalizedCity);
  const existingDraft = drafts.find((draft) => draft._id === draftId);
  const nextPlace = {
    ...place,
    id: place.id || `${draftId}-${place.name || "place"}`
  };

  if (!existingDraft) {
    const createdAt = new Date().toISOString();
    const newDraft = {
      _id: draftId,
      city: normalizedCity,
      days: 1,
      placesPerDay: 1,
      status: "draft",
      itinerary: {
        ...buildEmptyItinerary(),
        day1: {
          label: "Day 1",
          morning: [nextPlace],
          afternoon: [],
          evening: []
        }
      },
      route: { geometry: [] },
      createdAt,
      updatedAt: createdAt,
      source: "explore"
    };

    const nextDrafts = [newDraft, ...drafts];
    saveDrafts(nextDrafts);
    return nextDrafts;
  }

  const placeExists = Object.values(existingDraft.itinerary || {}).some((day) =>
    ["morning", "afternoon", "evening"].some((slot) =>
      (day?.[slot] || []).some((item) => item.id === nextPlace.id)
    )
  );

  if (placeExists) {
    return drafts;
  }

  const nextDrafts = drafts.map((draft) => {
    if (draft._id !== draftId) {
      return draft;
    }

    return {
      ...draft,
      updatedAt: new Date().toISOString(),
      itinerary: {
        ...(draft.itinerary || buildEmptyItinerary()),
        day1: {
          label: draft.itinerary?.day1?.label || "Day 1",
          morning: [...(draft.itinerary?.day1?.morning || []), nextPlace],
          afternoon: draft.itinerary?.day1?.afternoon || [],
          evening: draft.itinerary?.day1?.evening || []
        }
      }
    };
  });

  saveDrafts(nextDrafts);
  return nextDrafts;
};

export const removeLocalDraftTrip = (draftId) => {
  const nextDrafts = safeParseDrafts().filter((draft) => draft._id !== draftId);
  saveDrafts(nextDrafts);
  return nextDrafts;
};

export const updateLocalTripStatus = (tripId, status) => {
  const nextDrafts = safeParseDrafts().map((draft) =>
    draft._id === tripId
      ? {
          ...draft,
          status,
          updatedAt: new Date().toISOString()
        }
      : draft
  );

  saveDrafts(nextDrafts);
  return nextDrafts;
};

export const updateLocalTripReview = (tripId, tripReview) => {
  const nextDrafts = safeParseDrafts().map((draft) =>
    draft._id === tripId
      ? {
          ...draft,
          tripReview: {
            rating: Number(tripReview.rating),
            budgetSpent:
              tripReview.budgetSpent === null ||
              tripReview.budgetSpent === undefined ||
              tripReview.budgetSpent === ""
                ? null
                : Number(tripReview.budgetSpent),
            comment: String(tripReview.comment || "").trim(),
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        }
      : draft
  );

  saveDrafts(nextDrafts);
  return nextDrafts;
};

export const upsertLocalDraftTrip = (trip = {}) => {
  const normalizedCity = String(trip.city || "").trim();

  if (!normalizedCity) {
    return safeParseDrafts();
  }

  const draftId = String(trip._id || createDraftId(normalizedCity));
  const drafts = safeParseDrafts();
  const now = new Date().toISOString();
  const nextDraft = {
    _id: draftId,
    city: normalizedCity,
    days: Number(trip.days) || 1,
    placesPerDay: Number(trip.placesPerDay) || 3,
    status: trip.status || "saved",
    itinerary: trip.itinerary || buildEmptyItinerary(),
    interests: Array.isArray(trip.interests) ? trip.interests : [],
    coordinates: trip.coordinates || null,
    weather: Array.isArray(trip.weather) ? trip.weather : [],
    route: trip.route || { geometry: [] },
    startDate: trip.startDate || "",
    endDate: trip.endDate || "",
    dates: trip.dates || "",
    travelStyle: trip.travelStyle || "",
    optimizeForBudget: Boolean(trip.optimizeForBudget),
    budgetEstimate: trip.budgetEstimate || null,
    tripReview: trip.tripReview || null,
    createdAt: trip.createdAt || now,
    updatedAt: now,
    source: trip.source || "planner"
  };

  const existingIndex = drafts.findIndex((draft) => draft._id === draftId);

  const nextDrafts =
    existingIndex >= 0
      ? drafts.map((draft, index) => (index === existingIndex ? { ...draft, ...nextDraft } : draft))
      : [nextDraft, ...drafts];

  saveDrafts(nextDrafts);
  return nextDrafts;
};

export const getLocalDraftPlacesForCity = (city) => {
  const draftId = createDraftId(city);
  const draft = safeParseDrafts().find((item) => item._id === draftId);

  if (!draft) {
    return [];
  }

  return Object.values(draft.itinerary || {}).flatMap((day) => [
    ...(day?.morning || []),
    ...(day?.afternoon || []),
    ...(day?.evening || [])
  ]);
};
