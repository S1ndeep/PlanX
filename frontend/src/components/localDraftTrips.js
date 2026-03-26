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
