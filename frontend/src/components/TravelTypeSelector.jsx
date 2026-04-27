const travelTypes = [
  {
    title: "Camper Trip",
    icon: "RV",
    description: "Roadside stays, scenic detours, and slow travel freedom.",
    accent: "Coastal loops"
  },
  {
    title: "Flight Trip",
    icon: "FL",
    description: "Fast city hops and polished itineraries across regions.",
    accent: "Efficient escapes"
  },
  {
    title: "Road Trip",
    icon: "RD",
    description: "Flexible routes between coastlines, towns, and viewpoints.",
    accent: "Open-route planning"
  }
];

const TravelTypeSelector = () => {
  return (
    <section className="mt-16 rounded-[38px] border border-[#4dd4ff]/20 bg-[#0a4952]/72 p-8 shadow-[0_28px_90px_rgba(3,18,24,0.18)] backdrop-blur-md animate-[fadeUp_1100ms_ease-out] lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
            Travel direction
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Choose the kind of momentum you want before the itinerary starts taking shape.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
            From scenic camper routes to quick flight-based getaways, choose the mood of your
            journey and start building a plan that fits.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {travelTypes.map((type) => (
            <button
              key={type.title}
              type="button"
              className="group rounded-[28px] border border-white/10 bg-[#0b3b43]/80 p-5 text-left text-white transition hover:-translate-y-1 hover:border-[#5ddfff]/25 hover:bg-[#114951] hover:shadow-[0_16px_50px_rgba(30,199,243,0.18)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold tracking-[0.24em] text-[#8edcff]">
                  {type.icon}
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b2edff]">
                  {type.accent}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-100">{type.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">{type.description}</p>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-[#55daff]/40 to-transparent" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#8edcff]">
                Use this as your starting mood
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelTypeSelector;
