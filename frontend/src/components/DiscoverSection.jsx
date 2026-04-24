const mapPins = [
  { name: "Barcelona", top: "28%", left: "67%" },
  { name: "Madrid", top: "42%", left: "48%" },
  { name: "Seville", top: "66%", left: "33%" },
  { name: "Valencia", top: "52%", left: "62%" }
];

const DiscoverSection = () => {
  return (
    <section className="px-6 py-24 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="animate-[fadeUp_900ms_ease-out]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
            Discover Destinations
          </p>
          <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight text-white sm:text-5xl">
            Discover Spain through coastlines, culture, and beautifully connected cities.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
            From beach towns on the Mediterranean to lively plazas in Madrid and Seville, TripWise
            helps you explore Spain visually before you lock in a single stop.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-[#0b3b43]/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur">
              <p className="text-3xl font-semibold text-white">120+</p>
              <p className="mt-2 text-sm text-slate-200">attractions, tapas spots, and cultural stops ready to plan</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#0b3b43]/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur">
              <p className="text-3xl font-semibold text-white">Smart</p>
              <p className="mt-2 text-sm text-slate-200">route-aware planning for faster city-to-city travel decisions</p>
            </div>
          </div>
        </div>

        <div className="animate-[fadeUp_1100ms_ease-out]">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0a4952]/72 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="absolute -right-12 top-8 h-36 w-36 rounded-full bg-[#1ec7f3]/20 blur-3xl" />
            <div className="absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-[#8edcff]/20 blur-3xl" />

            <div className="relative mx-auto flex aspect-[1.15] max-w-xl items-center justify-center rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(241,245,249,0.92)_100%)]">
              <div className="absolute inset-[10%] rounded-[28px] border border-dashed border-slate-300/80" />
              <svg viewBox="0 0 320 240" className="h-full w-full">
                <path
                  d="M73 79c15-19 42-32 74-37 36-6 73-6 102 10 23 13 41 37 43 61 2 26-14 51-35 68-24 18-57 29-92 31-37 2-75-6-104-24-24-16-40-40-39-64 0-18 17-31 31-45 7-6 14-13 20-20z"
                  fill="#e2e8f0"
                />
                <path
                  d="M90 93c18-19 48-28 80-30 34-2 68 4 91 20 19 12 31 33 30 52-1 21-16 41-37 56-22 15-51 26-82 27-32 1-65-7-89-23-21-14-36-33-37-52 0-19 15-35 28-50 5-6 11-13 16-20z"
                  fill="#cbd5e1"
                />
                <path
                  d="M118 112c16-12 37-18 58-18 20 0 39 4 56 13 13 8 27 18 32 31 6 13 2 31-8 44-11 14-29 26-50 33-23 7-49 9-70 3-20-5-34-18-43-34-9-14-12-32-8-44 5-13 18-21 33-28z"
                  fill="#94a3b8"
                />
              </svg>

              {mapPins.map((pin) => (
                <div
                  key={pin.name}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <div className="h-4 w-4 rounded-full border-4 border-white bg-orange-500 shadow-lg" />
                  <span className="mt-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {pin.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;
