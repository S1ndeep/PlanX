const iconThemes = {
  Hotels: {
    symbol: "HT",
    accent: "from-sky-100 to-cyan-200",
    ring: "border-sky-200/80",
    text: "text-sky-700"
  },
  Flights: {
    symbol: "FL",
    accent: "from-indigo-100 to-sky-200",
    ring: "border-indigo-200/80",
    text: "text-indigo-700"
  },
  Activities: {
    symbol: "AC",
    accent: "from-amber-100 to-orange-200",
    ring: "border-amber-200/80",
    text: "text-amber-700"
  },
  "Car Rentals": {
    symbol: "CR",
    accent: "from-emerald-100 to-cyan-200",
    ring: "border-emerald-200/80",
    text: "text-emerald-700"
  }
};

const BookingCard = ({ title, description, href, badge, partner }) => {
  const theme = iconThemes[title] || iconThemes.Hotels;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(244,249,252,0.62)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px] transition duration-300 hover:-translate-y-1.5 hover:border-[#8edcff]/65 hover:shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[20px] border ${theme.ring} bg-gradient-to-br ${theme.accent} text-sm font-semibold uppercase tracking-[0.22em] ${theme.text} shadow-sm`}
        >
          {theme.symbol}
        </div>
        <div className="flex flex-col items-end gap-2">
          {badge && (
            <span className="rounded-full border border-[#8edcff]/45 bg-[#effcff]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#147ea2]">
              {badge}
            </span>
          )}
          {partner && (
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              {partner}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-[30px] font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-[20px] border border-white/60 bg-[rgba(255,255,255,0.58)] px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Booking Partner
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">{partner}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#147ea2] transition group-hover:text-[#0d6b89]">
          Open
          <span aria-hidden="true">-&gt;</span>
        </span>
      </div>
    </a>
  );
};

export default BookingCard;
