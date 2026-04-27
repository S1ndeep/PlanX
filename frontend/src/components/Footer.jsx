import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/plan-trip", label: "Plan Trip" },
  { to: "/my-trips", label: "My Trips" },
  { to: "/support", label: "Support" }
];

const Footer = () => {
  return (
    <footer className="px-6 pb-16 pt-8 text-white sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[38px] border border-white/10 bg-[#0a4952]/55 px-8 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="brand-script text-[3.25rem] text-white">TripWise</p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200">
              Smart travel planning layered over routes, weather, places, and shared experiences.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8edcff]">
              <span className="rounded-full bg-white/8 px-4 py-2">Destinations</span>
              <span className="rounded-full bg-white/8 px-4 py-2">Routing</span>
              <span className="rounded-full bg-white/8 px-4 py-2">Weather</span>
              <span className="rounded-full bg-white/8 px-4 py-2">Itinerary editing</span>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 lg:min-w-[320px]">
            {footerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#8edcff]/25 hover:text-[#8edcff]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Plan faster, then keep refining once the first itinerary lands.</p>
            <p className="uppercase tracking-[0.18em] text-white/55">TripWise travel workspace</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
