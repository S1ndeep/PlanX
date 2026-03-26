import { useState } from "react";
import PlacesMap from "./PlacesMap.jsx";
import { buildTripDays, flattenTripPlaces, getDayWiseDirections } from "./tripUtils.js";

const slotLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening"
};

const TripDetailsModal = ({ trip, onClose }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  if (!trip) {
    return null;
  }

  const dayGroups = buildTripDays(trip);
  const places = flattenTripPlaces(trip);
  const dayWiseDirections = getDayWiseDirections(trip, { useCurrentLocation });

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm sm:px-6">
      <div className="w-full max-w-6xl rounded-[36px] border border-white/30 bg-[rgba(250,250,250,0.78)] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.3)] backdrop-blur-[28px] lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
              Trip Details
            </p>
            <h2 className="mt-3 text-4xl font-semibold capitalize tracking-tight text-slate-950">
              {trip.city} itinerary
            </h2>
            <p className="mt-3 text-base text-slate-600">
              {trip.days} day trip with {places.length} saved places.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/50 bg-[rgba(255,255,255,0.7)] px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {dayWiseDirections.length > 0 && (
              <section className="rounded-[30px] border border-white/45 bg-[rgba(255,255,255,0.55)] p-5 backdrop-blur-[20px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                      Day-wise Directions
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                      Open Google Maps for each day of the trip
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Each button opens only that day&apos;s route. Day 1 uses your saved start
                      location unless you switch to current location, and each next day starts from
                      the final stop of the previous day.
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex items-center gap-3 rounded-[20px] border border-white/50 bg-[rgba(255,255,255,0.42)] px-4 py-3 text-sm text-slate-700 backdrop-blur-md">
                  <input
                    type="checkbox"
                    checked={useCurrentLocation}
                    onChange={(event) => setUseCurrentLocation(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="font-medium">Use my current location for Day 1</span>
                  <span className="text-slate-500">
                    {useCurrentLocation
                      ? "Day 1 ignores the saved start location."
                      : trip.startLocation
                        ? `Day 1 starts from ${trip.startLocation}.`
                        : "No saved start location, so Day 1 starts from the first stop."}
                  </span>
                </label>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {dayWiseDirections.map((dayRoute) => (
                    <div
                      key={`day-route-${dayRoute.dayNumber}`}
                      className="rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.48)] p-4 backdrop-blur-md"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Day {dayRoute.dayNumber}
                      </p>
                      <div className="mt-4 space-y-2">
                        {dayRoute.stops.map((stop, index) => (
                          <div
                            key={`${stop}-${index}`}
                            className="rounded-[16px] border border-white/55 bg-[rgba(255,255,255,0.72)] px-3 py-2 text-sm font-medium text-slate-800"
                          >
                            {stop}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(dayRoute.url, "_blank", "noopener,noreferrer")}
                        className="mt-4 rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                      >
                        Get Directions
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dayGroups.map((day) => (
              <section
                key={day.dayKey}
                className="rounded-[30px] border border-white/45 bg-[rgba(255,255,255,0.55)] p-5 backdrop-blur-[20px]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                  {day.label}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {Object.entries(slotLabels).map(([slotKey, slotLabel]) => (
                    <div
                      key={`${day.dayKey}-${slotKey}`}
                      className="rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.48)] p-4 backdrop-blur-md"
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {slotLabel}
                      </h3>
                      <div className="mt-4 space-y-3">
                        {(day[slotKey] || []).length > 0 ? (
                          day[slotKey].map((place, index) => (
                            <div
                              key={`${place.id || place.name}-${index}`}
                              className="rounded-[18px] border border-white/55 bg-[rgba(255,255,255,0.7)] px-3 py-3"
                            >
                              <p className="text-sm font-semibold text-slate-900">{place.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {place.category || place.interest || "Stop"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[18px] border border-dashed border-white/60 bg-[rgba(255,255,255,0.42)] px-3 py-6 text-center text-xs text-slate-500">
                            No places added.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="xl:sticky xl:top-8">
            <PlacesMap
              places={places}
              routeGeometry={trip.route?.geometry || []}
              selectedPlaceId={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
