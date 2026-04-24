import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadLocalDraftTrips } from "./localDraftTrips.js";
import { countTripPlaces, isDraftTrip } from "./tripUtils.js";

const API_BASE_URL = "http://localhost:5000";

const buildFocusLabel = (trip = {}) => {
  if (Array.isArray(trip.interests) && trip.interests.length > 0) {
    return trip.interests.slice(0, 2).join(" + ");
  }

  if (Array.isArray(trip.destinations) && trip.destinations.length > 0) {
    return trip.destinations.slice(0, 2).join(" + ");
  }

  return "Flexible itinerary";
};

const buildPaceLabel = (trip = {}) => {
  const explicitPace = Number(trip.placesPerDay);

  if (explicitPace > 0) {
    return `${explicitPace} places/day`;
  }

  const days = Number(trip.days) || 1;
  const placesCount = countTripPlaces(trip);
  const calculatedPace = Math.max(1, Math.round(placesCount / days));
  return `${calculatedPace} places/day`;
};

const normalizeTrip = (trip = {}) => ({
  ...trip,
  destination: trip.city || "Untitled trip",
  cardLabel: isDraftTrip(trip) ? "Saved Draft" : "Saved Trip",
  title: isDraftTrip(trip)
    ? `${trip.city || "Untitled"} Planning Draft`
    : `${trip.city || "Untitled"} Trip`,
  durationLabel: `${trip.days || 1} ${Number(trip.days) === 1 ? "day" : "days"}`,
  stopsLabel: `${countTripPlaces(trip)} ${countTripPlaces(trip) === 1 ? "place" : "places"}`,
  dateLabel:
    trip.dates ||
    (trip.startDate && trip.endDate ? `${trip.startDate} to ${trip.endDate}` : `${trip.days || 1} day trip`)
});

const MyTripsCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [trips, setTrips] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      const localDraftTrips = loadLocalDraftTrips();

      try {
        if (!token) {
          if (isMounted) {
            setTrips(localDraftTrips);
            setLoaded(true);
          }
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverTrips = response.data.trips || [];

        if (isMounted) {
          setTrips([...localDraftTrips, ...serverTrips]);
          setLoaded(true);
        }
      } catch {
        if (isMounted) {
          setTrips(localDraftTrips);
          setLoaded(true);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const carouselTrips = useMemo(
    () =>
      trips
        .filter((trip) => trip?.city)
        .sort(
          (firstTrip, secondTrip) =>
            new Date(secondTrip.updatedAt || secondTrip.createdAt || 0).getTime() -
            new Date(firstTrip.updatedAt || firstTrip.createdAt || 0).getTime()
        )
        .map(normalizeTrip),
    [trips]
  );

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return undefined;
    }

    const updateScrollState = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 8);
      setCanScrollRight(maxScrollLeft - container.scrollLeft > 8);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [carouselTrips.length]);

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const scrollAmount = Math.max(container.clientWidth * 0.86, 280);
    container.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section
      className={`w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(13,55,62,0.82)] p-3.5 text-white shadow-[0_12px_28px_rgba(3,18,24,0.12)] transition duration-500 ${
        loaded ? "animate-[fadeUp_820ms_ease-out]" : "opacity-0"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
            Saved Plans
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <p className="text-sm font-medium text-white/90">Recent plans</p>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
              {carouselTrips.length} saved
            </span>
          </div>
        </div>

        {carouselTrips.length > 0 && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              disabled={!canScrollLeft}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Scroll trips left"
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              disabled={!canScrollRight}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Scroll trips right"
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        )}
      </div>

      {carouselTrips.length === 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/12 bg-[rgba(255,255,255,0.08)] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
          <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.08)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8edcff]">
              No trips yet
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Start planning your first trip!
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Create your first itinerary and it will appear here as a personalized dashboard shortcut.
            </p>
            <button
              type="button"
              onClick={() => navigate("/plan-trip")}
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 transition hover:bg-slate-100"
            >
              Start Planning
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-1 touch-pan-x"
          >
            {carouselTrips.map((trip) => (
              <article
                key={trip._id}
                className="h-[172px] w-[238px] shrink-0 snap-start rounded-[22px] border border-[#cde7ef]/30 bg-[linear-gradient(180deg,rgba(170,205,216,0.92),rgba(128,171,184,0.9))] p-3 text-slate-900 shadow-[0_8px_18px_rgba(2,18,24,0.08)] sm:w-[232px] md:w-[236px] lg:w-[238px]"
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0d7aa3]">
                      {trip.cardLabel}
                    </p>
                    <h3 className="mt-2 text-[15px] font-semibold leading-tight text-slate-950">
                      {trip.title}
                    </h3>
                  </div>

                  <div className="grid gap-1.5 rounded-[18px] border border-[#e6f4f8]/45 bg-[rgba(224,240,245,0.74)] p-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Dates
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-700">{trip.dateLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Saved Places
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-700">{trip.stopsLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/trip-view", { state: trip })}
                      className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      View Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/itinerary", { state: trip })}
                      className="rounded-full bg-[#6f95a3] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#628997]"
                    >
                      {isDraftTrip(trip) ? "Edit Draft" : "Edit Trip"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 sm:hidden">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              disabled={!canScrollLeft}
              className="flex h-10 flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              disabled={!canScrollRight}
              className="flex h-10 flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default MyTripsCarousel;
