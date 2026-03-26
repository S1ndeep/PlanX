import { Link } from "react-router-dom";

const DestinationCard = ({ destination }) => {
  return (
    <article className="group overflow-hidden rounded-[32px] border border-white/10 bg-[#0b3b43]/68 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(15,23,42,0.18)]">
      <div className="relative h-72 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-900">
          {destination.tag}
        </span>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-2xl font-semibold text-white">{destination.name}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-200">{destination.description}</p>
        </div>

        <Link
          to={`/destination/${destination.name}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#1ec7f3] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#53d6f7]"
        >
          Explore
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};

export default DestinationCard;
