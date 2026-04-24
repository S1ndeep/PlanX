import PlacesMap from "./PlacesMap.jsx";
import { buildTripDays, flattenTripPlaces } from "./tripUtils.js";

const slotLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening"
};

const TripDetailsModal = ({ trip, onClose }) => {
  if (!trip) {
    return null;
  }

  const dayGroups = buildTripDays(trip);
  const places = flattenTripPlaces(trip);

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
