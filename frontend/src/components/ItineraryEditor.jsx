import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import PlaceCard from "./PlaceCard.jsx";
import PlaceCardSkeleton from "./PlaceCardSkeleton.jsx";

const sectionStyles = {
  morning: {
    title: "Morning",
    accent: "bg-sky-100 text-sky-700 border-sky-200"
  },
  afternoon: {
    title: "Afternoon",
    accent: "bg-amber-100 text-amber-700 border-amber-200"
  },
  evening: {
    title: "Evening",
    accent: "bg-rose-100 text-rose-700 border-rose-200"
  }
};

const getSortableId = (dayKey, slot, place, index) =>
  `${dayKey}::${slot}::${place.id || `place-${index}`}`;

const slotOrder = ["morning", "afternoon", "evening"];

const flattenDayPlaces = (dayValue = {}) =>
  slotOrder.flatMap((slot) => dayValue?.[slot] || []);

const getLegLookupKey = (fromPlace, toPlace) =>
  `${fromPlace?.id || fromPlace?.name || "unknown"}::${toPlace?.id || toPlace?.name || "unknown"}`;

const buildInitialOpenState = (itinerary) =>
  Object.keys(itinerary).reduce((accumulator, dayKey, index) => {
    accumulator[dayKey] = true;
    return accumulator;
  }, {});

const getPreviousPlaceInDaySequence = (dayValue = {}, slot, index) => {
  if (index > 0) {
    return dayValue?.[slot]?.[index - 1] || null;
  }

  const slotIndex = slotOrder.indexOf(slot);

  if (slotIndex <= 0) {
    return null;
  }

  for (let reverseIndex = slotIndex - 1; reverseIndex >= 0; reverseIndex -= 1) {
    const previousSlotPlaces = dayValue?.[slotOrder[reverseIndex]] || [];
    if (previousSlotPlaces.length > 0) {
      return previousSlotPlaces[previousSlotPlaces.length - 1];
    }
  }

  return null;
};

const ItineraryEditor = ({
  itinerary,
  setItinerary,
  onOpenAddModal,
  onPlaceSelect,
  routeLegs = [],
  loading = false,
  readOnly = false
}) => {
  const [openDays, setOpenDays] = useState(() => buildInitialOpenState(itinerary));

  useEffect(() => {
    setOpenDays((current) => {
      const next = { ...current };
      const dayKeys = Object.keys(itinerary);

      dayKeys.forEach((dayKey, index) => {
        if (!(dayKey in next)) {
          next[dayKey] = true;
        }
      });

      Object.keys(next).forEach((dayKey) => {
        if (!dayKeys.includes(dayKey)) {
          delete next[dayKey];
        }
      });

      return next;
    });
  }, [itinerary]);

  const tripSummary = useMemo(
    () =>
      Object.entries(itinerary).map(([dayKey, dayValue]) => ({
        dayKey,
        label: dayValue.label,
        totalStops: ["morning", "afternoon", "evening"].reduce(
          (count, slot) => count + (dayValue[slot]?.length || 0),
          0
        )
      })),
    [itinerary]
  );

  const routeLegLookup = useMemo(
    () =>
      new Map(
        routeLegs.map((leg) => [
          `${leg.fromId || leg.from}::${leg.toId || leg.to}`,
          leg
        ])
      ),
    [routeLegs]
  );

  const addPlace = (dayKey, slot, place) => {
    setItinerary((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        [slot]: [...current[dayKey][slot], place]
      }
    }));
  };

  const removePlace = (dayKey, slot, placeIndex) => {
    setItinerary((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        [slot]: current[dayKey][slot].filter((_, index) => index !== placeIndex)
      }
    }));
  };

  const editPlace = (dayKey, slot, placeIndex, updatedPlace) => {
    setItinerary((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        [slot]: current[dayKey][slot].map((place, index) =>
          index === placeIndex ? updatedPlace : place
        )
      }
    }));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    const [activeDayKey, activeSlot] = String(active.id).split("::");
    const [overDayKey, overSlot] = String(over.id).split("::");

    setItinerary((current) => {
      const activeItems = current[activeDayKey]?.[activeSlot] || [];
      const overItems = current[overDayKey]?.[overSlot] || [];
      const oldIndex = activeItems.findIndex(
        (place, index) => getSortableId(activeDayKey, activeSlot, place, index) === active.id
      );
      const newIndex = overItems.findIndex(
        (place, index) => getSortableId(overDayKey, overSlot, place, index) === over.id
      );

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const next = structuredClone(current);

      if (activeDayKey === overDayKey && activeSlot === overSlot) {
        next[activeDayKey][activeSlot] = arrayMove(activeItems, oldIndex, newIndex);
        return next;
      }

      const [movedPlace] = next[activeDayKey][activeSlot].splice(oldIndex, 1);
      next[overDayKey][overSlot].splice(newIndex, 0, movedPlace);

      return next;
    });
  };

  const toggleDay = (dayKey) => {
    setOpenDays((current) => ({
      ...current,
      [dayKey]: !current[dayKey]
    }));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-5">
        <div className="rounded-[30px] border border-white/45 bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            {tripSummary.map((day) => (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => toggleDay(day.dayKey)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  openDays[day.dayKey]
                    ? "border-[#8edcff]/40 bg-[#0b3b43]/70 text-white"
                    : "border-white/50 bg-white/70 text-slate-700"
                }`}
              >
                {day.label}: {day.totalStops} {day.totalStops === 1 ? "stop" : "stops"}
              </button>
            ))}
          </div>
        </div>

        {Object.entries(itinerary).map(([dayKey, dayValue]) => (
          <section
            key={dayKey}
            className="rounded-[32px] border border-white/45 bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_14px_44px_rgba(15,23,42,0.08)] lg:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                  {dayValue.label}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {tripSummary.find((day) => day.dayKey === dayKey)?.totalStops || 0} planned stops
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onOpenAddModal(dayKey, "morning", addPlace)}
                    className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                  >
                    Add Place
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleDay(dayKey)}
                  className="rounded-full border border-white/50 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  {openDays[dayKey] ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/50 bg-white/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Day Stops
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {tripSummary.find((day) => day.dayKey === dayKey)?.totalStops || 0}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/50 bg-white/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Route Flow
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Morning to Afternoon to Evening
                </p>
              </div>
            </div>

            {openDays[dayKey] && (
              <div className="mt-5 grid items-stretch gap-4 xl:grid-cols-3">
                {slotOrder.map((slot) => {
                  const sortableItems = dayValue[slot].map((place, index) =>
                    getSortableId(dayKey, slot, place, index)
                  );

                  return (
                    <div
                      key={`${dayKey}-${slot}`}
                      className="rounded-[26px] border border-white/45 bg-[rgba(248,250,252,0.94)] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${sectionStyles[slot].accent}`}
                          >
                            {sectionStyles[slot].title}
                          </span>
                          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {dayValue[slot].length} {dayValue[slot].length === 1 ? "stop" : "stops"}
                          </span>
                        </div>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => onOpenAddModal(dayKey, slot, addPlace)}
                            className="rounded-full border border-white/50 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
                        <div className="space-y-3">
                          {loading &&
                            Array.from({ length: 2 }).map((_, index) => (
                              <PlaceCardSkeleton key={`${dayKey}-${slot}-skeleton-${index}`} />
                            ))}

                          {dayValue[slot].map((place, index) => {
                            const previousPlaceInDay = getPreviousPlaceInDaySequence(dayValue, slot, index);
                            const matchingLeg = previousPlaceInDay
                              ? routeLegLookup.get(getLegLookupKey(previousPlaceInDay, place))
                              : null;

                            return (
                              <div
                                key={getSortableId(dayKey, slot, place, index)}
                                className="h-full space-y-2"
                              >
                                <PlaceCard
                                  sortableId={getSortableId(dayKey, slot, place, index)}
                                  place={place}
                                  onSelect={onPlaceSelect}
                                  isFirstStopInRoute={!previousPlaceInDay}
                                  distanceFromPreviousKm={matchingLeg?.distanceKm ?? null}
                                  durationFromPreviousMinutes={matchingLeg?.durationMinutes ?? null}
                                  onDelete={() => removePlace(dayKey, slot, index)}
                                  onSave={(updatedPlace) => editPlace(dayKey, slot, index, updatedPlace)}
                                  readOnly={readOnly}
                                />
                              </div>
                            );
                          })}

                          {!loading && dayValue[slot].length === 0 && (
                            <div className="rounded-[24px] border border-dashed border-white/60 bg-[rgba(255,255,255,0.84)] px-4 py-10 text-center text-sm text-slate-500">
                              Drag places here or add a new stop.
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </DndContext>
  );
};

export default ItineraryEditor;
