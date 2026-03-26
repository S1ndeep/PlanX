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

  const handleDirectionsToggle = () => {
    if (destinations.length === 0) {
      window.alert("This trip does not have any destinations yet.");
      return;
    }

    onToggleExpand?.(trip._id);
  };

  return (
    <article
      className={`overflow-hidden rounded-[32px] border bg-[rgba(255,255,255,0.58)] shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px] transition-all duration-300 ${
        expanded
          ? "border-[#7edcf4] shadow-[0_28px_90px_rgba(30,199,243,0.18)] ring-1 ring-[#8edcff]/40"
          : "border-white/45"
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                Upcoming Trip
              </p>
              <h3 className="mt-2 text-3xl font-semibold capitalize text-white">{trip.city}</h3>
            </div>
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
              {trip.days} {trip.days === 1 ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {mode === "draft" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
              Saved Draft
            </p>
            <h3 className="mt-3 text-2xl font-semibold capitalize text-slate-950">
              {trip.city} planning draft
            </h3>
          </div>
        )}

        <div className="grid gap-3 rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.44)] p-5 backdrop-blur-md sm:grid-cols-2">
          {mode === "upcoming" ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Trip Duration
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {trip.days} {trip.days === 1 ? "day" : "days"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Places in Route
                </p>
                <p className="mt-2 text-sm text-slate-700">{placesCount} stops planned</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Start Date
                </p>
                <p className="mt-2 text-sm text-slate-700">{startDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Last Updated
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Last Edited
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Saved Places
                </p>
                <p className="mt-2 text-sm text-slate-700">{placesCount} stops in draft</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDirectionsToggle}
            className="rounded-full border border-[#8edcff]/35 bg-[#115b67]/60 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#30d3f5] hover:text-slate-950"
          >
            {expanded ? "Hide Directions" : "Get Directions"}
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(trip)}
            className={`rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-md transition ${
              mode === "upcoming"
                ? "border border-white/60 bg-[rgba(255,255,255,0.65)] text-slate-800 hover:bg-white"
                : "border border-[#8edcff]/35 bg-[#0b3b43]/55 text-white hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            }`}
          >
            {mode === "upcoming" ? "Edit Trip" : "Edit Draft"}
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(trip)}
            disabled={deleting}
            className="rounded-full border border-red-200/80 bg-[rgba(255,255,255,0.6)] px-5 py-3 text-sm font-semibold text-red-700 backdrop-blur-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="rounded-[26px] border border-[#8edcff]/35 bg-[rgba(255,255,255,0.5)] p-6 backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                    Inline Itinerary
                  </p>
                  <h4 className="mt-3 text-2xl font-semibold capitalize text-slate-950">
                    {trip.city} {mode === "draft" ? "draft" : "trip"} details
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    {trip.days} {trip.days === 1 ? "day" : "days"} with day-wise itinerary and
                    route buttons.
                  </p>
                </div>
                <span className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {dayWiseDirections.length} route{dayWiseDirections.length === 1 ? "" : "s"}
                </span>
              </div>

              {dayWiseDirections.length > 0 && (
                <label className="mt-5 flex items-center gap-3 rounded-[20px] border border-white/50 bg-[rgba(255,255,255,0.42)] px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={useCurrentLocationForDayOne}
                    onChange={(event) => setUseCurrentLocationForDayOne(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="font-medium">Use my current location for Day 1</span>
                  <span className="text-slate-500">
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
                  const placesForDay = [
                    ...(day.morning || []),
                    ...(day.afternoon || []),
                    ...(day.evening || [])
                  ];

                  return (
                    <section
                      key={day.dayKey}
                      className="rounded-[24px] border border-[#bfefff]/45 bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#147ea2]">
                            {day.label}
                          </p>
                          <p className="mt-2 text-sm text-slate-500">
                            {(route?.stops || placesForDay).length} stop
                            {(route?.stops || placesForDay).length === 1 ? "" : "s"}
                          </p>
                        </div>
                        {route && (
                          <button
                            type="button"
                            onClick={() => window.open(route.url, "_blank", "noopener,noreferrer")}
                            className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/70 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(11,59,67,0.18)] transition-all duration-300 hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
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
                                className="rounded-[16px] border border-white/55 bg-[rgba(255,255,255,0.8)] px-3 py-2 text-sm font-medium text-slate-800"
                              >
                                {placeName}
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-[16px] border border-dashed border-slate-300 bg-white/50 px-3 py-5 text-center text-xs text-slate-500">
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
