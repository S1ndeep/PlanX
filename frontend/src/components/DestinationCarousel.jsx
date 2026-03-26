import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const destinations = [
  {
    name: "Goa",
    region: "Featured Destinations",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    description: "A strong base for building beach routes, food stops, and easy coastal day plans."
  },
  {
    name: "Jaipur",
    region: "Featured Destinations",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
    description: "Ideal for heritage-focused itineraries with forts, markets, and compact city circuits."
  },
  {
    name: "Manali",
    region: "Featured Destinations",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80",
    description: "Useful for mountain itineraries that balance viewpoints, drives, and local stops."
  },
  {
    name: "Udaipur",
    region: "Featured Destinations",
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
    description: "Well-suited for lakefront planning with landmarks, walks, and relaxed evening routes."
  },
  {
    name: "Rishikesh",
    region: "Featured Destinations",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
    description: "Great for combining riverfront places, activity stops, and short scenic transfers."
  }
];

const DestinationCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % destinations.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const previousIndex = (activeIndex - 1 + destinations.length) % destinations.length;
  const nextIndex = (activeIndex + 1) % destinations.length;
  const activeDestination = destinations[activeIndex];
  const previousDestination = destinations[previousIndex];
  const nextDestination = destinations[nextIndex];

  return (
    <section className="mt-14 flex flex-col items-center animate-[fadeUp_1200ms_ease-out]">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.34em] text-[#8edcff]">
        Featured destinations
      </p>
      <h2 className="mt-4 text-center text-3xl font-semibold text-white sm:text-4xl">
        See how TripWise frames standout cities
      </h2>
      <p className="mt-3 max-w-2xl text-center text-sm leading-7 text-slate-200 sm:text-base">
        Browse a few planning-ready places, then jump into the destination page or go straight to itinerary generation.
      </p>

      <div className="mt-8 grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[110px_0.72fr_1fr_0.72fr_110px]">
        <button
          type="button"
          onClick={() => setActiveIndex(previousIndex)}
          className="mx-auto hidden h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl text-white backdrop-blur transition hover:bg-white/10 lg:flex"
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <article className="hidden overflow-hidden rounded-[30px] border border-white/10 bg-[#0b3b43]/52 p-4 text-white opacity-60 backdrop-blur transition duration-500 md:block">
          <img
            src={previousDestination.image}
            alt={previousDestination.name}
            className="h-64 w-full rounded-[22px] object-cover"
          />
          <p className="mt-4 text-center text-lg font-semibold">{previousDestination.name}</p>
        </article>

        <article className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0d3e46]/68 p-5 text-white shadow-[0_28px_90px_rgba(3,18,24,0.18)] backdrop-blur-md transition duration-500">
          <img
            src={activeDestination.image}
            alt={activeDestination.name}
            className="h-72 w-full rounded-[26px] object-cover transition duration-700 hover:scale-[1.03]"
          />
          <div className="mx-auto max-w-xl space-y-4 px-2 pb-4 pt-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8edcff]">
              {activeDestination.region}
            </p>
            <h3 className="text-3xl font-semibold leading-tight">{activeDestination.name}</h3>
            <p className="text-sm leading-7 text-slate-200">{activeDestination.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to={`/destination/${activeDestination.name}`}
                className="inline-flex rounded-full bg-[#1ec7f3] px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 transition hover:bg-[#53d6f7]"
              >
                Explore
              </Link>
              <Link
                to="/plan-trip"
                state={{ destination: activeDestination.name }}
                className="inline-flex rounded-full border border-white/15 bg-white/10 px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/14"
              >
                Plan This Trip
              </Link>
            </div>
          </div>
        </article>

        <article className="hidden overflow-hidden rounded-[30px] border border-white/10 bg-[#0b3b43]/52 p-4 text-white opacity-60 backdrop-blur transition duration-500 md:block">
          <img
            src={nextDestination.image}
            alt={nextDestination.name}
            className="h-64 w-full rounded-[22px] object-cover"
          />
          <p className="mt-4 text-center text-lg font-semibold">{nextDestination.name}</p>
        </article>

        <button
          type="button"
          onClick={() => setActiveIndex(nextIndex)}
          className="mx-auto hidden h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl text-white backdrop-blur transition hover:bg-white/10 lg:flex"
        >
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {destinations.map((destination, index) => (
          <button
            key={destination.name}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition ${
              index === activeIndex ? "w-8 bg-[#1ec7f3]" : "w-2.5 bg-white/35"
            }`}
            aria-label={`Show ${destination.name}`}
          />
        ))}
      </div>

      <Link
        to={`/destination/${activeDestination.name}`}
        className="mt-8 inline-flex rounded-full bg-[#1ec7f3] px-10 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_20px_60px_rgba(30,199,243,0.28)] transition hover:-translate-y-0.5 hover:bg-[#53d6f7]"
      >
        Explore Destination
      </Link>
    </section>
  );
};

export default DestinationCarousel;
