const iconThemes = {
  Hotels: {
    symbol: "HT",
    accent: "from-[#1ec8a5]/30 via-[#1ec8a5]/16 to-transparent",
    ring: "border-[#46e4c1]/30",
    text: "text-[#7df0d2]",
    glow: "shadow-[0_0_42px_rgba(30,200,165,0.18)]",
    cta: "from-[#1ec8a5] to-[#37d5e6]"
  },
  Flights: {
    symbol: "FL",
    accent: "from-[#2da9ff]/28 via-[#2da9ff]/14 to-transparent",
    ring: "border-[#5cc3ff]/30",
    text: "text-[#81d0ff]",
    glow: "shadow-[0_0_42px_rgba(45,169,255,0.18)]",
    cta: "from-[#2d8eff] to-[#6dc7ff]"
  },
  Activities: {
    symbol: "AC",
    accent: "from-[#f59e0b]/28 via-[#fb923c]/16 to-transparent",
    ring: "border-[#f8b84b]/30",
    text: "text-[#ffd18a]",
    glow: "shadow-[0_0_42px_rgba(245,158,11,0.16)]",
    cta: "from-[#f59e0b] to-[#fb923c]"
  },
  "Car Rentals": {
    symbol: "CR",
    accent: "from-[#34d399]/28 via-[#14b8a6]/14 to-transparent",
    ring: "border-[#51e0a8]/30",
    text: "text-[#88f3c1]",
    glow: "shadow-[0_0_42px_rgba(52,211,153,0.16)]",
    cta: "from-[#34d399] to-[#14b8a6]"
  }
};

const BookingCard = ({ title, description, href, badge, partner, priceRange, rating, distance, recommendation }) => {
  const theme = iconThemes[title] || iconThemes.Hotels;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,40,50,0.92)_0%,rgba(10,25,35,0.97)_100%)] p-6 shadow-[0_24px_80px_rgba(2,12,18,0.38)] backdrop-blur-[18px] transition duration-300 hover:-translate-y-2 hover:border-white/18 hover:shadow-[0_28px_90px_rgba(0,0,0,0.46)] ${theme.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.accent} opacity-80 transition duration-300 group-hover:opacity-100`} />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="absolute -right-10 top-10 h-28 w-28 rounded-full bg-white/5 blur-3xl transition duration-300 group-hover:bg-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[22px] border ${theme.ring} bg-[rgba(6,18,24,0.74)] text-sm font-semibold uppercase tracking-[0.22em] ${theme.text} shadow-[0_14px_36px_rgba(0,0,0,0.28)]`}
        >
          {theme.symbol}
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {recommendation && (
            <span className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6eaf2]">
              {recommendation}
            </span>
          )}
          {badge && (
            <span className={`rounded-full border ${theme.ring} bg-[rgba(7,29,34,0.74)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${theme.text}`}>
              {badge}
            </span>
          )}
          {partner && (
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8faab5]">
              {partner}
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-8">
        <h3 className="text-[30px] font-semibold tracking-tight text-[#f5fbff]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#b8d3dc]">{description}</p>
      </div>

      <div className="relative mt-7 grid gap-4">
        <div className="rounded-[22px] border border-white/10 bg-[rgba(7,23,30,0.78)] px-5 py-4 backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8faab5]">
            Price range
          </p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${theme.text}`}>{priceRange}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6f8e99]">
            tuned for the destination and plan type
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium text-[#d6eaf2]">
            Rating {rating}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium text-[#d6eaf2]">
            Fit {distance}
          </span>
        </div>
      </div>

      <div className="relative mt-8 flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-4 backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8faab5]">
            Booking Partner
          </p>
          <p className="mt-1 text-sm font-medium text-[#f5fbff]">{partner}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${theme.cta} px-5 py-3 text-sm font-semibold text-[#021014] shadow-[0_12px_30px_rgba(45,169,255,0.22)] transition duration-300 group-hover:scale-[1.02]`}
        >
          View Deals
          <span aria-hidden="true">-&gt;</span>
        </span>
      </div>
    </a>
  );
};

export default BookingCard;
