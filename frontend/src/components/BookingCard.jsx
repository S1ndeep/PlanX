const iconThemes = {
  Hotels: {
    symbol: "🏨",
    accent: "border-l-8 border-sky-300",
    bg: "bg-gradient-to-br from-sky-100 to-cyan-100",
    text: "text-sky-700"
  },
  Flights: {
    symbol: "✈️",
    accent: "border-l-8 border-indigo-300",
    bg: "bg-gradient-to-br from-indigo-100 to-sky-100",
    text: "text-indigo-700"
  },
  Activities: {
    symbol: "🎟️",
    accent: "border-l-8 border-amber-300",
    bg: "bg-gradient-to-br from-amber-100 to-orange-100",
    text: "text-amber-700"
  },
  "Car Rentals": {
    symbol: "🚗",
    accent: "border-l-8 border-emerald-300",
    bg: "bg-gradient-to-br from-emerald-100 to-cyan-100",
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
      className={`group flex flex-col justify-between h-full rounded-2xl border border-[#53d6f7]/30 bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#53d6f7] ${theme.accent}`}
      style={{ minHeight: 220 }}
    >
      <div className="flex items-center gap-4 px-6 pt-6">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${theme.bg} text-3xl font-extrabold ${theme.text} shadow-lg`}>
          {theme.symbol}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold tracking-tight text-[#0f172a]">{title}</h3>
          {badge && (
            <span className="rounded-full border border-[#53d6f7]/60 bg-[#e0f7fa]/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#147ea2]">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="px-6 pt-4 flex-1">
        <p className="text-base leading-7 text-slate-700 mb-2">{description}</p>
      </div>
      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{partner}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-base font-bold text-[#147ea2] transition group-hover:text-[#0d6b89] bg-[#e0f7fa]/80 px-4 py-2 rounded-xl shadow">
          Book Now
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
};

export default BookingCard;
