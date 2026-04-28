import HeroSection from "../components/HeroSection.js";
import UserReviewsShowcase from "../components/UserReviewsShowcase.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";

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

const studioTools = [
  {
    title: "Road Trip Builder",
    description: "Build long-distance routes with fuel-stop suggestions and route previews.",
    to: "/road-trip",
    cta: "Open Road Trip"
  },
  {
    title: "AI Itinerary Studio",
    description: "Generate a smart day plan with interests, budget, and duration in seconds.",
    to: "/ai-planner",
    cta: "Open AI Planner"
  },
  {
    title: "Group Collaboration",
    description: "Create shared trips and invite friends with one collaboration link.",
    to: "/trip-groups",
    cta: "Open Groups"
  },
  {
    title: "Expense Control",
    description: "Track trip costs and estimate spend distribution before and during travel.",
    to: "/trip-expenses",
    cta: "Open Expenses"
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#062f35]">
      <HeroSection />
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#08353d_0%,#062f35_100%)]">
        {/* TripWise Tools section moved here, above Featured Destinations */}
        <div className="relative mx-auto max-w-7xl px-6 pt-8 sm:px-10 lg:px-12">
          <section className="rounded-[34px] border border-white/10 bg-[#063841]/55 p-6 text-white shadow-[0_24px_80px_rgba(2,20,24,0.14)] backdrop-blur-md sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8edcff]">
                  TripWise Tools
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Advanced features are now split by workflow
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                  Pick exactly what you need instead of opening one combined studio page.
                </p>
              </div>
              <Link
                to="/plan-trip"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
              >
                Start with Plan Trip
              </Link>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {studioTools.map((tool) => (
                <article
                  key={tool.title}
                  className="rounded-[26px] border border-white/10 bg-[rgba(6,28,33,0.62)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <h3 className="text-xl font-semibold">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{tool.description}</p>
                  <Link
                    to={tool.to}
                    className="mt-4 inline-flex rounded-full bg-[#4dd4ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-[#82e3ff]"
                  >
                    {tool.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,199,243,0.18),transparent_30%),radial-gradient(circle_at_15%_40%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_70%_85%,rgba(30,199,243,0.12),transparent_25%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pb-8 sm:px-10 lg:px-12">
          {/* ...existing code... (feature destination, why, planning flow, reviews, etc.) */}
        </div>
        <div className="relative">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
