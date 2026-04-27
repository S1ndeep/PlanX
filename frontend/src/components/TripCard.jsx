import { memo, useMemo, useState } from "react";
import { buildTripDays, countTripPlaces, getTripImage, getTripStartDate } from "./tripUtils.js";

const buildRoutePoint = (place = {}) => {
  if (typeof place.latitude === "number" && typeof place.longitude === "number") {
    return `${place.latitude},${place.longitude}`;
  }

  return place.address || place.name || "";
};

const buildGoogleMapsDirectionsUrl = (places = []) => {
  const routePoints = places.map(buildRoutePoint).filter(Boolean);

  if (routePoints.length < 2) {
    return "";
  }

  const [origin, ...rest] = routePoints;
  const destination = rest[rest.length - 1];
  const waypoints = rest.slice(0, -1);
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving"
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const formatBudgetSpent = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not added";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Not added";
  }

  return `INR ${numericValue.toLocaleString()}`;
};

const TripCard = ({
  trip,
  mode = "upcoming",
  onView,
  onEdit,
  onMarkComplete,
  onAddReview,
  onDelete,
  deleting = false
}) => {
  const [showDirections, setShowDirections] = useState(false);
  const image = getTripImage(trip);
  const placesCount = countTripPlaces(trip);
  const startDate = getTripStartDate(trip);
  const tripDateLabel =
    trip.dates ||
    (trip.startDate && trip.endDate ? `${trip.startDate} to ${trip.endDate}` : startDate.toLocaleDateString());
  const tripDays = useMemo(() => buildTripDays(trip), [trip]);

  return (
    <article className="overflow-hidden rounded-[32px] border border-white/45 bg-[rgba(255,255,255,0.58)] shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
      {(mode === "upcoming" || mode === "completed") && (
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
                {mode === "completed" ? "Completed Trip" : "Upcoming Trip"}
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
          {mode === "upcoming" || mode === "completed" ? (
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
                  Dates
                </p>
                <p className="mt-2 text-sm text-slate-700">{tripDateLabel}</p>
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
                  Dates
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {tripDateLabel}
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
            onClick={() => onView?.(trip)}
            className="rounded-full border border-white/60 bg-[rgba(255,255,255,0.65)] px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:bg-white"
          >
            View Trip
          </button>

          {mode !== "completed" && (
            <button
              type="button"
              onClick={() => setShowDirections((current) => !current)}
              className="rounded-full border border-[#8edcff]/35 bg-[rgba(255,255,255,0.72)] px-5 py-3 text-sm font-semibold text-[#0b3b43] backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#e8fbff]"
            >
              {showDirections ? "Hide Directions" : "Directions"}
            </button>
          )}

          {mode === "upcoming" ? (
            <button
              type="button"
              onClick={() => onEdit?.(trip)}
              className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            >
              Edit Trip
            </button>
          ) : null}

          {mode === "draft" ? (
            <button
              type="button"
              onClick={() => onEdit?.(trip)}
              className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            >
              Edit Draft
            </button>
          ) : null}

          {mode === "upcoming" || mode === "draft" ? (
            <button
              type="button"
              onClick={() => onMarkComplete?.(trip)}
              className="rounded-full border border-emerald-200/80 bg-[rgba(255,255,255,0.72)] px-5 py-3 text-sm font-semibold text-emerald-700 backdrop-blur-md transition hover:bg-emerald-50"
            >
              Mark as Complete
            </button>
          ) : null}

          {mode === "completed" ? (
            <button
              type="button"
              onClick={() => onAddReview?.(trip)}
              className="rounded-full border border-amber-200/80 bg-[rgba(255,255,255,0.72)] px-5 py-3 text-sm font-semibold text-amber-700 backdrop-blur-md transition hover:bg-amber-50"
            >
              Add Review
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onDelete?.(trip)}
            disabled={deleting}
            className="rounded-full border border-red-200/80 bg-[rgba(255,255,255,0.6)] px-5 py-3 text-sm font-semibold text-red-700 backdrop-blur-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {mode === "completed" && trip.tripReview?.rating ? (
          <div className="mt-6 rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.52)] p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
              Your Review
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Rating
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {trip.tripReview.rating}/5
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Budget Spent
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatBudgetSpent(trip.tripReview.budgetSpent)}
                </p>
              </div>
            </div>
            {trip.tripReview.comment ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Review
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600">{trip.tripReview.comment}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {mode !== "completed" && showDirections && (
          <div className="mt-6 rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.52)] p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
              Day Routes
            </p>
            <div className="mt-4 space-y-4">
              {tripDays.map((day) => {
                const dayPlaces = [...day.morning, ...day.afternoon, ...day.evening];
                const directionsUrl = buildGoogleMapsDirectionsUrl(dayPlaces);

                return (
                  <div
                    key={day.dayKey}
                    className="rounded-[20px] border border-white/60 bg-white/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {dayPlaces.length} {dayPlaces.length === 1 ? "stop" : "stops"}
                        </p>
                      </div>
                      {directionsUrl ? (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
                        >
                          Open Route
                        </a>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Need 2 valid stops
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      {dayPlaces.map((place, index) => (
                        <p key={`${day.dayKey}-${place.id || place.name}-${index}`}>
                          {index + 1}. {place.name || place.address || "Stop"}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default memo(TripCard);
