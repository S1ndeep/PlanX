import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="px-6 pb-24 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[#0a4952]/72 px-8 py-14 text-white shadow-[0_32px_100px_rgba(15,23,42,0.18)] backdrop-blur sm:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                Final step
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
                Ready for your next adventure?
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-200">
                Turn inspiration into a route, a weather-aware plan, and a shareable trip your
                whole group can follow.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/plan-trip"
                className="rounded-full bg-[#1ec7f3] px-7 py-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#53d6f7]"
              >
                Plan Your Trip
              </Link>
              <Link
                to="/explore"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Browse Cities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
