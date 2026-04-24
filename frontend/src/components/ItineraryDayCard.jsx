import CategoryIcon from "./CategoryIcon.jsx";

const slotStyles = {
  Morning: "from-sky-50 to-white border-sky-100",
  Afternoon: "from-amber-50 to-white border-amber-100",
  Evening: "from-rose-50 to-white border-rose-100"
};

const ItineraryDayCard = ({ dayPlan }) => {
  return (
    <article className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
            Day {dayPlan.day}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Suggested route
          </h2>
        </div>
        <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          {dayPlan.places.length} stops
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {dayPlan.slots.map((slot) => (
          <div
            key={`${dayPlan.day}-${slot.timeOfDay}`}
            className={`rounded-3xl border bg-gradient-to-br p-5 ${slotStyles[slot.timeOfDay] || "from-slate-50 to-white border-slate-100"}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                <CategoryIcon interest={slot.place?.interest || "landmarks"} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {slot.timeOfDay}
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {slot.place?.name || "Open exploration"}
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-600">{slot.description}</p>

            {slot.place && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                  {slot.place.category}
                </span>
                {slot.place.rating && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    {slot.place.rating}/10
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
};

export default ItineraryDayCard;
