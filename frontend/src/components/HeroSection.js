import { Link } from "react-router-dom";
import TravelTypeSelector from "./TravelTypeSelector.jsx";
import DestinationCarousel from "./DestinationCarousel.jsx";

const statHighlights = [
  { value: "5", label: "interest modes ready to mix" },
  { value: "1 flow", label: "from discovery to itinerary" },
  { value: "Editable", label: "after generation" }
];

const floatingHighlights = [
  {
    title: "Smart itinerary planning",
    description: "Build day-by-day routes with places, timing, and practical travel flow."
  },
  {
    title: "Flexible itinerary editing",
    description: "Adjust stops, reorder plans, and refine each day as your trip takes shape."
  },
  {
    title: "Destination-led planning",
    description: "Explore cities, compare highlights, and turn ideas into usable itineraries."
  }
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[1480px] overflow-hidden bg-[#062f35]">
      <img
        src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80"
        alt="Aerial tropical shoreline with forest and turquoise water"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.18)_0%,rgba(4,24,31,0.3)_24%,rgba(4,24,31,0.6)_56%,rgba(4,24,31,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.16),transparent_30%),linear-gradient(90deg,rgba(4,24,31,0.16),transparent_36%,rgba(4,24,31,0.22)_100%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-10 lg:px-12 lg:pt-36">
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div className="max-w-3xl pt-8 animate-[fadeUp_900ms_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8edcff]">
              Intentional trip design
            </p>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-[5.3rem]">
              Build trips that feel cinematic before you even leave home.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              TripWise combines destination discovery, itinerary generation, and attraction curation
              into one polished planning flow, so your first draft already feels usable.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/plan-trip"
                className="rounded-full bg-[#1ec7f3] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_20px_60px_rgba(30,199,243,0.35)] transition hover:-translate-y-0.5 hover:bg-[#53d6f7]"
              >
                Start Planning
              </Link>
              <Link
                to="/explore"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-white/15"
              >
                Explore Destinations
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {statHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-[rgba(12,55,63,0.56)] px-5 py-5 shadow-[0_18px_50px_rgba(3,18,24,0.12)] backdrop-blur-md"
                >
                  <p className="text-2xl font-semibold text-[#8edcff]">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:justify-items-end">
            <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[rgba(10,42,49,0.74)] p-6 text-white shadow-[0_28px_90px_rgba(3,18,24,0.18)] backdrop-blur-md animate-[fadeUp_820ms_ease-out]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                Planning snapshot
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Destination</p>
                  <p className="mt-2 text-lg font-semibold">Jaipur, 4 days</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Focus</p>
                    <p className="mt-2 text-base font-semibold">Landmarks + Food</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Pace</p>
                    <p className="mt-2 text-base font-semibold">3 places/day</p>
                  </div>
                </div>
              </div>
            </div>

            {floatingHighlights.map((item, index) => (
              <div
                key={item.title}
                className={`max-w-sm rounded-[28px] border border-white/10 bg-[#10353d]/65 p-5 text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] backdrop-blur-md animate-[fadeUp_1000ms_ease-out] ${
                  index === 0 ? "lg:mr-0" : index === 1 ? "lg:mr-12" : "lg:mr-5"
                }`}
              >
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <TravelTypeSelector />
        <DestinationCarousel />
      </div>
    </section>
  );
};

export default HeroSection;
