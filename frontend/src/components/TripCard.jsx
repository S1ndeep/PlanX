import { useState } from "react";
import {
  buildTripDays,
  countTripPlaces,
  getDayWiseDirections,
  getTripDestinations,
  getTripImage,
  getTripStartDate
} from "./tripUtils.js";

const TripCard = ({
  trip,
  mode = "upcoming",
  expanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  deleting = false
}) => {
  const [useCurrentLocationForDayOne, setUseCurrentLocationForDayOne] = useState(false);
  const image = getTripImage(trip);
  const placesCount = countTripPlaces(trip);
  const startDate = getTripStartDate(trip);
  const destinations = getTripDestinations(trip);
  const dayGroups = buildTripDays(trip);
  const dayWiseDirections = getDayWiseDirections(trip, {
    useCurrentLocation: useCurrentLocationForDayOne
  });
  const now = new Date();
  const daysUntilTrip = Math.max(
    0,
    Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const status =
    mode === "draft"
      ? "Draft"
      : daysUntilTrip > 0
        ? "Planned"
        : "Completed";
  const budgetPreview = mode === "draft" ? `₹${(trip.days || 2) * 3500}` : `₹${(trip.days || 2) * 5200}`;

  const handleDirectionsToggle = () => {
    if (destinations.length === 0) {
      window.alert("This trip does not have any destinations yet.");
      return;
    }

    onToggleExpand?.(trip._id);
  };

  return (
    <article
      className={`overflow-hidden rounded-[34px] border bg-[linear-gradient(180deg,rgba(7,30,38,0.82)_0%,rgba(14,47,58,0.72)_100%)] shadow-[0_24px_80px_rgba(3,18,24,0.2)] backdrop-blur-[24px] transition-all duration-300 ${
        expanded
          ? "border-[#8edcff]/30 shadow-[0_30px_100px_rgba(3,18,24,0.24)] ring-1 ring-[#8edcff]/30"
          : "border-white/10"
      }`}
    >
      {mode === "upcoming" && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={trip.city}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = `https://source.unsplash.com/featured/900x600/?${encodeURIComponent(
                trip.city || "travel"
              )}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071e26]/88 via-[#071e26]/18 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                Upcoming Trip
              </p>
              <h3 className="mt-2 font-[var(--font-editorial)] text-3xl font-semibold capitalize text-white">
                {trip.city}
              </h3>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
              {trip.days} {trip.days === 1 ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {mode === "draft" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
              Saved Draft
            </p>
            <h3 className="mt-3 font-[var(--font-editorial)] text-3xl font-semibold capitalize text-white">
              {trip.city} planning draft
            </h3>
          </div>
        )}

        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2 rounded-[20px] border border-white/10 bg-white/6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Trip status
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{status}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Mini budget preview
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{budgetPreview}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Countdown
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {mode === "draft"
                    ? "Draft in progress"
                    : daysUntilTrip > 0
                      ? `Trip in ${daysUntilTrip} day${daysUntilTrip === 1 ? "" : "s"}`
                      : "Trip completed"}
                </p>
              </div>
            </div>
          </div>

          {mode === "upcoming" ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Trip Duration
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {trip.days} {trip.days === 1 ? "day" : "days"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Places in Route
                </p>
                <p className="mt-2 text-sm text-slate-200">{placesCount} stops planned</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Start Date
                </p>
                <p className="mt-2 text-sm text-slate-200">{startDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Last Updated
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Last Edited
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Saved Places
                </p>
                <p className="mt-2 text-sm text-slate-200">{placesCount} stops in draft</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDirectionsToggle}
            className="rounded-full bg-[linear-gradient(135deg,#15283d_0%,#264968_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {expanded ? "Hide Directions" : "Get Directions"}
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(trip)}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
          >
            {mode === "upcoming" ? "Edit Trip" : "Edit Draft"}
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(trip)}
            disabled={deleting}
            className="rounded-full border border-red-400/35 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        <div
          className={`grid transition-all duration-300 ${
            expanded ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-[26px] border border-white/10 bg-white/6 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                    Inline Itinerary
                  </p>
                  <h4 className="mt-3 font-[var(--font-editorial)] text-3xl font-semibold capitalize text-white">
                    {trip.city} {mode === "draft" ? "draft" : "trip"} details
                  </h4>
                  <p className="mt-2 text-sm text-slate-300">
                    {trip.days} {trip.days === 1 ? "day" : "days"} with day-wise itinerary and route buttons.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {dayWiseDirections.length} route{dayWiseDirections.length === 1 ? "" : "s"}
                </span>
              </div>

              {dayWiseDirections.length > 0 && (
                <label className="mt-5 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={useCurrentLocationForDayOne}
                    onChange={(event) => setUseCurrentLocationForDayOne(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="font-medium">Use my current location for Day 1</span>
                  <span className="text-slate-400">
                    {useCurrentLocationForDayOne
                      ? "Day 1 ignores the saved start location."
                      : trip.startLocation
                        ? `Day 1 starts from ${trip.startLocation}.`
                        : "No saved start location, so Day 1 starts from the first stop."}
                  </span>
                </label>
              )}

              <div className="mt-5 space-y-4">
                {dayGroups.map((day, index) => {
                  const route = dayWiseDirections[index];
                  const placesForDay = [...(day.morning || []), ...(day.afternoon || []), ...(day.evening || [])];

                  return (
                    <section
                      key={day.dayKey}
                      className="rounded-[24px] border border-white/10 bg-[rgba(7,30,38,0.64)] p-5 shadow-[0_12px_35px_rgba(15,23,42,0.12)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8edcff]">
                            {day.label}
                          </p>
                          <p className="mt-2 text-sm text-slate-300">
                            {(route?.stops || placesForDay).length} stop
                            {(route?.stops || placesForDay).length === 1 ? "" : "s"}
                          </p>
                        </div>
                        {route && (
                          <button
                            type="button"
                            onClick={() => window.open(route.url, "_blank", "noopener,noreferrer")}
                            className="rounded-full bg-[linear-gradient(135deg,#15283d_0%,#264968_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(11,59,67,0.18)] transition-all duration-300 hover:opacity-95"
                          >
                            Get Directions
                          </button>
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        {(route?.stops || placesForDay).length > 0 ? (
                          (route?.stops || placesForDay).map((place, indexValue) => {
                            const placeName = typeof place === "string" ? place : place?.name || "Stop";

                            return (
                              <div
                                key={`${day.dayKey}-${placeName}-${indexValue}`}
                                className="rounded-[16px] border border-white/10 bg-white/8 px-3 py-2 text-sm font-medium text-white"
                              >
                                {placeName}
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-[16px] border border-dashed border-white/10 bg-white/6 px-3 py-5 text-center text-xs text-slate-400">
                            No places added for this day.
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TripCard;
