import HeroSection from "../components/HeroSection.js";
import Footer from "../components/Footer.jsx";
import TrustedByTravelers from "../components/TrustedByTravelers.jsx";

const planningSteps = [
  {
    label: "01",
    title: "Choose a city",
    description: "Start with a destination and TripWise brings the planning surface into focus."
  },
  {
    label: "02",
    title: "Shape the vibe",
    description: "Balance landmarks, food, parks, museums, and shopping around your available days."
  },
  {
    label: "03",
    title: "Generate and refine",
    description: "Build the first itinerary fast, then adjust the stops and day flow as needed."
  }
];

const proofPoints = [
  { value: "Day-by-day", label: "structured itinerary generation" },
  { value: "Live", label: "attraction fetching before planning" },
  { value: "Flexible", label: "editing after the first draft" }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#062f35]">
      <HeroSection />
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#08353d_0%,#062f35_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,199,243,0.18),transparent_30%),radial-gradient(circle_at_15%_40%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_70%_85%,rgba(30,199,243,0.12),transparent_25%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-2 sm:px-10 lg:px-12">
          <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[34px] border border-white/10 bg-[#0a4952]/50 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Why it feels better
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                A travel planner that behaves more like a creative studio than a form.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-200 sm:text-base">
                We kept the experience focused on momentum: quick destination selection, a clear
                itinerary brief, attraction pre-selection, and a polished route you can keep refining.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <div
                    key={point.label}
                    className="rounded-[26px] border border-white/10 bg-[#0b3b43]/72 p-5"
                  >
                    <p className="text-2xl font-semibold text-[#8edcff]">{point.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{point.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Planning flow
              </p>
              <div className="mt-6 grid gap-4">
                {planningSteps.map((step) => (
                  <div
                    key={step.label}
                    className="flex gap-4 rounded-[26px] border border-white/10 bg-[#0b3b43]/64 p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1ec7f3] text-sm font-bold text-slate-950">
                      {step.label}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-200">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <TrustedByTravelers />

        <div className="relative">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
