import { useEffect, useState } from "react";

const categoryToInterest = (category) => {
  if (category === "restaurant" || category === "cafe") return "food";
  if (category === "museum") return "museums";
  if (category === "park") return "parks";
  return "landmarks";
};

const AddPlaceModal = ({
  isOpen,
  onClose,
  onAdd,
  dayOptions,
  defaultDayKey,
  defaultSlot,
  suggestedPlaces = []
}) => {
  const [formState, setFormState] = useState({
    dayKey: defaultDayKey,
    slot: defaultSlot,
    name: "",
    category: "attraction",
    description: ""
  });
  const [selectedSuggestedPlace, setSelectedSuggestedPlace] = useState(null);

  useEffect(() => {
    setFormState({
      dayKey: defaultDayKey,
      slot: defaultSlot,
      name: "",
      category: "attraction",
      description: ""
    });
    setSelectedSuggestedPlace(null);
  }, [defaultDayKey, defaultSlot, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const basePlace = selectedSuggestedPlace
      ? {
          ...selectedSuggestedPlace,
          id: selectedSuggestedPlace.id || `suggested-${Date.now()}`,
          address: selectedSuggestedPlace.address || "",
          latitude: selectedSuggestedPlace.latitude ?? null,
          longitude: selectedSuggestedPlace.longitude ?? null,
          image: selectedSuggestedPlace.image,
          preview: selectedSuggestedPlace.preview,
          rating: selectedSuggestedPlace.rating
        }
      : {
          id: `custom-${Date.now()}`,
          address: "",
          latitude: null,
          longitude: null
        };

    onAdd(formState.dayKey, formState.slot, {
      ...basePlace,
      name: formState.name,
      category: formState.category,
      description: formState.description,
      interest: categoryToInterest(formState.category)
    });

    onClose();
  };

  const handleSelectSuggestedPlace = (place) => {
    setSelectedSuggestedPlace(place);
    setFormState((current) => ({
      ...current,
      name: place.name || "",
      category: place.category || "attraction",
      description: place.description || place.address || ""
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-4xl rounded-[30px] bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
              Add a stop
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Customize your itinerary</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Suggested places</p>
                <p className="text-sm text-slate-500">Pick from fetched attractions and restaurants.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {suggestedPlaces.length} options
              </span>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {suggestedPlaces.map((place, index) => (
                <button
                  key={place.id || `${place.name}-${index}`}
                  type="button"
                  onClick={() => handleSelectSuggestedPlace(place)}
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{place.name}</p>
                      <p className="mt-1 text-sm capitalize text-slate-500">{place.category}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {place.address || place.description || "Tap to use this place in your itinerary."}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {suggestedPlaces.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                  No fetched places available right now. You can still add one manually.
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={formState.dayKey}
                onChange={(event) => setFormState((current) => ({ ...current, dayKey: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400"
              >
                {dayOptions.map((dayOption) => (
                  <option key={dayOption.value} value={dayOption.value}>
                    {dayOption.label}
                  </option>
                ))}
              </select>

              <select
                value={formState.slot}
                onChange={(event) => setFormState((current) => ({ ...current, slot: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <input
              required
              value={formState.name}
              onChange={(event) => {
                setSelectedSuggestedPlace((current) =>
                  current ? { ...current, name: event.target.value } : current
                );
                setFormState((current) => ({ ...current, name: event.target.value }));
              }}
              placeholder="Place name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400"
            />

            <select
              value={formState.category}
              onChange={(event) => {
                setSelectedSuggestedPlace((current) =>
                  current ? { ...current, category: event.target.value } : current
                );
                setFormState((current) => ({ ...current, category: event.target.value }));
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400"
            >
              <option value="attraction">Attraction</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="museum">Museum</option>
              <option value="park">Park</option>
            </select>

            <textarea
              rows="4"
              value={formState.description}
              onChange={(event) => {
                setSelectedSuggestedPlace((current) =>
                  current ? { ...current, description: event.target.value } : current
                );
                setFormState((current) => ({ ...current, description: event.target.value }));
              }}
              placeholder="Optional description"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Add place
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlaceModal;
