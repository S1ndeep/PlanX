const toUnsplashFallback = (placeName = "travel place") =>
  `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(placeName)}`;

const getThumbnail = (place = {}) =>
  place.preview?.source || place.image || toUnsplashFallback(place.name);

const formatCategory = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Place";

const TravelPlaceNode = ({ place, onSelect, onRemove, label }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
    <button
      type="button"
      onClick={() => onSelect?.(place)}
      className="flex w-full items-center gap-4 text-left transition hover:-translate-y-0.5"
    >
      <img
        src={getThumbnail(place)}
        alt={place.name}
        className="h-20 w-20 rounded-2xl object-cover"
        onError={(event) => {
          event.currentTarget.src = toUnsplashFallback(place.name);
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          {label}
        </p>
        <h3 className="mt-2 text-base font-semibold text-slate-900">{place.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {formatCategory(place.category)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {place.address || "Tap to focus this stop on the map."}
        </p>
      </div>
    </button>

    {onRemove && (
      <button
        type="button"
        onClick={() => onRemove(place.id)}
        className="mt-4 rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
      >
        Remove
      </button>
    )}
  </div>
);

const TravelLegCard = ({
  startPlace,
  endPlace,
  distance,
  duration,
  onSelectPlace,
  onRemoveStart,
  onRemoveEnd
}) => {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <TravelPlaceNode
        place={startPlace}
        label="Start place"
        onSelect={onSelectPlace}
        onRemove={onRemoveStart}
      />

      <div className="flex flex-col items-center py-4">
        <div className="h-10 w-px bg-slate-200" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-5-5m5 5l5-5" />
          </svg>
        </div>
        <div className="mt-3 rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-700">
          {distance} • {duration}
        </div>
        <div className="mt-3 h-10 w-px bg-slate-200" />
      </div>

      <TravelPlaceNode
        place={endPlace}
        label="End place"
        onSelect={onSelectPlace}
        onRemove={onRemoveEnd}
      />
    </div>
  );
};

export default TravelLegCard;
