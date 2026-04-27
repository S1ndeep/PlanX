import { Link, useLocation } from "react-router-dom";
import { buildTripDays } from "../components/tripUtils.js";

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

const DirectionsPage = () => {
  const location = useLocation();
  const trip = location.state;

  if (!trip) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Directions not available</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
          Open directions from one of your saved trips so TripWise knows which route to build.
        </p>
        <Link
          to="/my-trips"
          className="mt-8 inline-flex rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
        >
          Back to My Trips
        </Link>
      </div>
    );
  }

  const tripDays = buildTripDays(trip);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-[36px] border border-white/45 bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
              Directions
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              {trip.city} route by day
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Open a Google Maps route for each day of your saved itinerary.
            </p>
          </div>
          <a
            href="/my-trips"
            onClick={(event) => {
              event.preventDefault();
              window.location.assign("/my-trips");
            }}
            className="relative z-20 pointer-events-auto inline-flex rounded-full border border-white/60 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:bg-white"
          >
            Back to My Trips
          </a>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {tripDays.map((day) => {
            const dayPlaces = [...day.morning, ...day.afternoon, ...day.evening];
            const directionsUrl = buildGoogleMapsDirectionsUrl(dayPlaces);

            return (
              <article
                key={day.dayKey}
                className="rounded-[30px] border border-white/50 bg-[rgba(255,255,255,0.7)] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                      {day.label}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {dayPlaces.length} {dayPlaces.length === 1 ? "stop" : "stops"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#eaf6fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#147ea2]">
                    Google Maps
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  {dayPlaces.map((place, index) => (
                    <p key={`${day.dayKey}-${place.id || place.name}-${index}`}>
                      {index + 1}. {place.name || place.address || "Stop"}
                    </p>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (directionsUrl) {
                        window.open(directionsUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    disabled={!directionsUrl}
                    className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {directionsUrl ? "Open Day Route" : "Need at least 2 valid stops"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DirectionsPage;
