import { memo, useEffect, useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CategoryIcon, { getCategoryMeta } from "./CategoryIcon.jsx";

const wikipediaCache = new Map();

const categoryToInterest = (category) => {
  if (category === "restaurant" || category === "cafe") return "food";
  if (category === "park") return "parks";
  if (category === "museum") return "museums";
  return "landmarks";
};

const toUnsplashFallback = (placeName) =>
  `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80`;

const formatDistance = (distanceKm) => {
  return `${distanceKm.toFixed(1)} km`;
};

const PlaceCard = ({
  sortableId,
  place,
  onDelete,
  onSave,
  onSelect,
  isFirstStopInRoute = false,
  distanceFromPreviousKm,
  durationFromPreviousMinutes,
  primaryActionLabel,
  onPrimaryAction,
  onAddToTravelLegs,
  isInTravelLegs = false,
  disableTravelLegsAction = false,
  showEditorActions = true,
  showDragHandle = true,
  readOnly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: sortableId,
    disabled: readOnly
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: place.name,
    category: place.category,
    description: place.description || ""
  });
  const [wikiData, setWikiData] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchWikipediaSummary = async () => {
      if (!place.name || place.description || place.preview?.source || place.image) {
        return;
      }

      const cached = wikipediaCache.get(place.name);
      if (cached) {
        setWikiData(cached);
        return;
      }

      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place.name)}`
        );
        if (!response.ok) {
          throw new Error("Wikipedia summary not found");
        }
        const summary = await response.json();
        wikipediaCache.set(place.name, summary);
        if (isMounted) {
          setWikiData(summary);
        }
      } catch {
        if (isMounted) {
          setWikiData(null);
        }
      }
    };

    fetchWikipediaSummary();

    return () => {
      isMounted = false;
    };
  }, [place.name]);

  useEffect(() => {
    setDraft({
      name: place.name,
      category: place.category,
      description: place.description || ""
    });
  }, [place.category, place.description, place.name]);

  const categoryMeta = useMemo(
    () => getCategoryMeta(place.category || place.interest || ""),
    [place.category, place.interest]
  );

  const imageUrl =
    place.preview?.source ||
    place.image ||
    wikiData?.thumbnail?.source ||
    wikiData?.originalimage?.source ||
    toUnsplashFallback(place.name);

  useEffect(() => {
    setIsImageLoading(true);
  }, [imageUrl]);

  const resolvedDescription =
    (isEditing ? draft.description : place.description) ||
    wikiData?.extract ||
    "A curated stop in your TripWise itinerary.";

  const resolvedRating =
    typeof place.rating === "number"
      ? place.rating.toFixed(1)
      : place.rating || null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleSave = () => {
    onSave({
      ...place,
      ...draft,
      interest: categoryToInterest(draft.category)
    });
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(place)}
      className={`flex h-full min-h-[380px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] ${
        isDragging ? "z-20 rotate-[1.2deg] shadow-[0_28px_90px_rgba(15,23,42,0.2)]" : ""
      }`}
    >
      <div className="relative h-36 overflow-hidden bg-slate-200">
        {isImageLoading && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
        <img
          src={imageUrl}
          alt={place.name}
          className={`h-full w-full object-cover transition duration-500 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsImageLoading(false)}
          onError={(event) => {
            event.currentTarget.src = toUnsplashFallback(place.name);
            setIsImageLoading(false);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm">
            {categoryMeta.icon} {categoryMeta.label}
          </span>
          {!readOnly && showDragHandle && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-950/75 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
            >
              Drag
            </button>
          )}
          {readOnly && showDragHandle && (
            <span className="rounded-full bg-slate-950/75 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
              View
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={draft.name}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400"
                />
                <select
                  value={draft.category}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400"
                >
                  <option value="attraction">Attraction</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="museum">Museum</option>
                  <option value="park">Park</option>
                </select>
                <textarea
                  rows="3"
                  value={draft.description}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400"
                  placeholder="Optional description"
                />
              </div>
            ) : (
              <>
                <h3 className="line-clamp-2 text-base font-semibold leading-7 text-slate-900">
                  {place.name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium">
                    {categoryMeta.icon} {categoryMeta.label}
                  </span>
                  {resolvedRating && <span>• ⭐{resolvedRating}</span>}
                </div>
              </>
            )}
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl text-white shadow-sm">
            <CategoryIcon category={place.category} interest={place.interest} />
          </div>
        </div>

        {!isEditing && (
          <div className="mt-3 space-y-3">
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{resolvedDescription}</p>
            {(isFirstStopInRoute ||
              (typeof distanceFromPreviousKm === "number" && !Number.isNaN(distanceFromPreviousKm))) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                {isFirstStopInRoute ? (
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  <span aria-hidden="true">📍</span>
                  <span>Starting point</span>
                </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <span aria-hidden="true">🚗</span>
                    {typeof durationFromPreviousMinutes === "number" && (
                      <span>{durationFromPreviousMinutes} min</span>
                    )}
                    {typeof durationFromPreviousMinutes === "number" && <span>•</span>}
                    <span>{formatDistance(distanceFromPreviousKm)}</span>
                    <span>•</span>
                    <span className="text-[#147ea2]">Directions</span>
                  </div>
                )}
              </div>
            )}
            {place.address && (
              <div className="grid gap-2 text-sm text-slate-500">
                <p>{place.address}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {!readOnly && showEditorActions && isEditing ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSave();
                }}
                className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setDraft({
                    name: place.name,
                    category: place.category,
                    description: place.description || ""
                  });
                  setIsEditing(false);
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
            </>
          ) : !readOnly && showEditorActions ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
                className="rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700"
              >
                Delete
              </button>
              {onAddToTravelLegs && (
                <button
                  type="button"
                  disabled={disableTravelLegsAction && !isInTravelLegs}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddToTravelLegs(place);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isInTravelLegs
                      ? "bg-sky-100 text-sky-700"
                      : disableTravelLegsAction
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  {isInTravelLegs ? "Added to Travel Legs" : "Add to Travel Legs"}
                </button>
              )}
            </>
          ) : null}

          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPrimaryAction(place);
              }}
              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
            >
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PlaceCard);
