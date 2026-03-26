import { Link } from "react-router-dom";

const getFallbackImage = (cityName, tag = "") => {
  const name = cityName.toLowerCase();

  const cityImageMap = {
    goa: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    jaipur: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
    manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
    rishikesh: "https://images.unsplash.com/photo-1585483959406-376f47db1716?auto=format&fit=crop&w=900&q=80",
    udaipur: "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?auto=format&fit=crop&w=900&q=80",
    pondicherry: "https://images.unsplash.com/photo-1589307357838-e9a130d4836b?auto=format&fit=crop&w=900&q=80",
    mumbai: "https://images.unsplash.com/photo-1598434192043-71111c1b3f6f?auto=format&fit=crop&w=900&q=80",
    delhi: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    bengaluru: "https://images.unsplash.com/photo-1588414744731-660b5b0b987a?auto=format&fit=crop&w=900&q=80",
    bangalore: "https://images.unsplash.com/photo-1588414744731-660b5b0b987a?auto=format&fit=crop&w=900&q=80",
    hyderabad: "https://images.unsplash.com/photo-1600537341806-2b7f1f8d8b73?auto=format&fit=crop&w=900&q=80",
    chennai: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
    kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80",
    kochi: "https://images.unsplash.com/photo-1661808123851-11e30ab30c34?auto=format&fit=crop&w=900&q=80",
    varanasi: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80"
  };

  if (cityImageMap[name]) {
    return cityImageMap[name];
  }

  const tagLower = tag.toLowerCase();
  if (tagLower.includes("beach")) return "https://source.unsplash.com/featured/900x600/?beach,india";
  if (tagLower.includes("heritage") || tagLower.includes("royal")) return "https://source.unsplash.com/featured/900x600/?palace,india";
  if (tagLower.includes("mountain") || tagLower.includes("snow")) return "https://source.unsplash.com/featured/900x600/?mountains,himalaya";
  if (tagLower.includes("spiritual")) return "https://source.unsplash.com/featured/900x600/?temple,india";
  if (tagLower.includes("lake") || tagLower.includes("romantic")) return "https://source.unsplash.com/featured/900x600/?lake,india";

  return `https://source.unsplash.com/featured/900x600/?${encodeURIComponent(cityName)},india`;
};

const travelTypeIcons = {
  beach: "Beach",
  heritage: "Heritage",
  adventure: "Adventure",
  food: "Food",
  spiritual: "Spiritual",
  mountain: "Mountain",
  romantic: "Romantic"
};

const defaultHighlights = [
  "Strong route planning potential",
  "Great for 2 to 4 day trips",
  "Works well with mixed interests"
];

const CityCard = ({ city, type = "default" }) => {
  const imageUrl = city.image || getFallbackImage(city.name, city.tag || "");
  const title = city.name;
  const region = city.state || city.region || "India";
  const budgetRange = city.budgetRange || "₹10k - ₹20k";
  const bestTime = city.bestTime || "Oct - Mar";
  const tags = city.tags || [city.tag].filter(Boolean);
  const highlights = city.highlights || defaultHighlights;
  const travelType = city.travelType || city.tag || "Destination";
  const hoverBadge =
    type === "trending"
      ? "Trending"
      : city.recommended
        ? "Recommended"
        : "Plan-worthy";

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-[rgba(7,31,39,0.62)] shadow-[0_24px_80px_rgba(3,18,24,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-[#8edcff]/35 hover:shadow-[0_30px_95px_rgba(3,18,24,0.24)]">
      <div className="relative h-72 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = getFallbackImage(title, city.tag || "");
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.05)_0%,rgba(4,24,31,0.22)_35%,rgba(4,24,31,0.85)_100%)]" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          {type === "trending" && (
            <span className="rounded-full bg-[#1ec7f3] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_14px_34px_rgba(30,199,243,0.28)]">
              Trending
            </span>
          )}
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            {travelTypeIcons[String(travelType).toLowerCase()] || travelType}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8edcff]">
            {hoverBadge}
          </p>
          <h3 className="mt-3 text-3xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-white/80">{region}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={`${title}-${tag}`}
              className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8edcff]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-200/90">
          {city.description || "A versatile city for discovery, planning, and itinerary building."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Estimated Budget
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{budgetRange}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Best Time
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{bestTime}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Quick Highlights
          </p>
          <div className="mt-3 space-y-2 text-sm text-white/80 opacity-80 transition duration-300 group-hover:opacity-100">
            {highlights.slice(0, 3).map((highlight, index) => (
              <p key={`${title}-highlight-${index}`}>• {highlight}</p>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">
            Smart discovery for TripWise
          </div>
          <Link
            to={`/destination/${title}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#1ec7f3] px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_16px_36px_rgba(30,199,243,0.28)] transition hover:bg-[#53d6f7]"
          >
            Explore
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CityCard;
