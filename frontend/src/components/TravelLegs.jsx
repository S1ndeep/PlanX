import TravelLegCard from "./TravelLegCard.jsx";

const TravelLegs = ({
  selectedPlaces = [],
  routeLeg = null,
  totalDistanceKm = 0,
  totalDurationMinutes = 0,
  onPlaceSelect,
  onRemovePlace
}) => {
  const hasCompleteRoute = selectedPlaces.length === 2 && routeLeg;
  const hasTwoSelectedWithoutRoute = selectedPlaces.length === 2 && !routeLeg;

  return (
    <div className="rounded-[28px] border border-white/45 bg-[rgba(255,255,255,0.58)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[26px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Travel Legs</h2>
          <p className="mt-2 text-sm text-slate-500">
            Select up to two itinerary places to compare a direct travel route between them.
          </p>
        </div>
        <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          {selectedPlaces.length}/2 selected
        </div>
      </div>

      {selectedPlaces.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {selectedPlaces.map((place, index) => (
            <div
              key={place.id}
              className="flex items-center gap-3 rounded-full border border-sky-200/80 bg-[rgba(236,251,255,0.75)] px-4 py-2 backdrop-blur-md"
            >
              <button
                type="button"
                onClick={() => onPlaceSelect?.(place)}
                className="text-sm font-semibold text-sky-700"
              >
                {index === 0 ? "Start" : "End"}: {place.name}
              </button>
              <button
                type="button"
                onClick={() => onRemovePlace?.(place.id)}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {hasCompleteRoute ? (
          <TravelLegCard
            startPlace={selectedPlaces[0]}
            endPlace={selectedPlaces[1]}
            distance={`${routeLeg.distanceKm} km`}
            duration={`${routeLeg.durationMinutes} min`}
            onSelectPlace={onPlaceSelect}
            onRemoveStart={onRemovePlace}
            onRemoveEnd={onRemovePlace}
          />
        ) : hasTwoSelectedWithoutRoute ? (
          <div className="rounded-[22px] border border-dashed border-amber-200/80 bg-[rgba(255,247,237,0.72)] px-4 py-8 text-center text-sm text-amber-700 backdrop-blur-md">
            TripWise could not calculate this route yet. Make sure both selected places have valid coordinates.
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/60 bg-[rgba(255,255,255,0.46)] px-4 py-8 text-center text-sm text-slate-500 backdrop-blur-md">
            Add two places to view the travel route.
          </div>
        )}
      </div>

      {hasCompleteRoute && (
        <div className="mt-5 rounded-[22px] border border-white/55 bg-[rgba(255,255,255,0.46)] px-4 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">Selected route summary</p>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              {totalDistanceKm} km • {totalDurationMinutes} min
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelLegs;
