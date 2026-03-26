import { countTripPlaces, getTripImage, getTripStartDate } from "./tripUtils.js";

const TripCard = ({
  trip,
  mode = "upcoming",
  onView,
  onEdit,
  onDelete,
  deleting = false
}) => {
  const image = getTripImage(trip);
  const placesCount = countTripPlaces(trip);
  const startDate = getTripStartDate(trip);

  return (
    <article className="overflow-hidden rounded-[32px] border border-white/45 bg-[rgba(255,255,255,0.58)] shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
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
            onClick={() => onView?.(trip)}
            className="rounded-full border border-white/60 bg-[rgba(255,255,255,0.65)] px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:bg-white"
          >
            View Trip
          </button>

          {mode === "upcoming" ? (
            <button
              type="button"
              onClick={() => onEdit?.(trip)}
              className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            >
              Edit Trip
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEdit?.(trip)}
              className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            >
              Edit Draft
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete?.(trip)}
            disabled={deleting}
            className="rounded-full border border-red-200/80 bg-[rgba(255,255,255,0.6)] px-5 py-3 text-sm font-semibold text-red-700 backdrop-blur-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default TripCard;
