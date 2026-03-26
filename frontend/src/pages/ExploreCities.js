import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import CityCard from "../components/CityCard.js";
import Footer from "../components/Footer.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import PlaceCardSkeleton from "../components/PlaceCardSkeleton.jsx";
import indiaDestinations from "../data/indiaDestinations.js";
import {
  addPlaceToLocalDraftTrip,
  getLocalDraftPlacesForCity
} from "../components/localDraftTrips.js";

const API_BASE_URL = "http://localhost:5000";

const curatedCities = [
  {
    id: 1,
    name: "Goa",
    description: "Beaches & Nightlife - Pristine coastlines meet vibrant parties",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    tag: "Beach",
    travelType: "Beach",
    budgetRange: "₹12,000 - ₹24,000",
    bestTime: "Nov - Feb",
    tags: ["Beach", "Nightlife", "Weekend"],
    highlights: ["Beach clubs and sunsets", "Scooter-friendly routes", "Strong budget-to-premium options"],
    trending: true
  },
  {
    id: 2,
    name: "Jaipur",
    description: "Royal Heritage - Explore magnificent forts and palaces",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
    tag: "Heritage",
    travelType: "Heritage",
    budgetRange: "₹10,000 - ₹22,000",
    bestTime: "Oct - Mar",
    tags: ["Heritage", "Food", "Palaces"],
    highlights: ["High-density sightseeing", "Strong food + culture mix", "Easy for 3 to 4 day itineraries"],
    trending: true
  },
  {
    id: 3,
    name: "Manali",
    description: "Snow & Mountains - Adventure in the Himalayan paradise",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80",
    tag: "Mountain",
    travelType: "Adventure",
    budgetRange: "₹14,000 - ₹28,000",
    bestTime: "Mar - Jun",
    tags: ["Adventure", "Mountain", "Road Trip"],
    highlights: ["Adventure-led planning", "Higher transfer time between stops", "Great for scenic stays"]
  },
  {
    id: 4,
    name: "Rishikesh",
    description: "Spiritual & Adventure - Yoga capital with thrilling river rafting",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
    tag: "Spiritual",
    travelType: "Adventure",
    budgetRange: "₹9,000 - ₹18,000",
    bestTime: "Sep - Apr",
    tags: ["Spiritual", "Adventure", "Wellness"],
    highlights: ["Mixes rafting with wellness stays", "Great for lighter budgets", "Easy weekend format"],
    trending: true
  },
  {
    id: 5,
    name: "Udaipur",
    description: "Romantic Lakes - City of lakes with stunning royal architecture",
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
    tag: "Romantic",
    travelType: "Heritage",
    budgetRange: "₹13,000 - ₹30,000",
    bestTime: "Oct - Mar",
    tags: ["Romantic", "Lakes", "Heritage"],
    highlights: ["Premium stay options stand out", "Relaxed sightseeing pace", "Strong couples destination"]
  },
  {
    id: 6,
    name: "Pondicherry",
    description: "French Charm - Blend of Indian and French colonial cultures",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80",
    tag: "Colonial",
    travelType: "Food",
    budgetRange: "₹11,000 - ₹20,000",
    bestTime: "Oct - Feb",
    tags: ["Food", "Colonial", "Cafe"],
    highlights: ["Cafe-led exploration", "Compact city movement", "Strong design + stay appeal"],
    trending: true
  }
];

const budgetOptions = ["All", "Low", "Medium", "High"];
const travelTypeOptions = ["All", "Beach", "Heritage", "Adventure", "Food"];

const getBudgetBucket = (rangeText = "") => {
  const numericValues = String(rangeText)
    .replace(/[₹,\s]/g, "")
    .split("-")
    .map((value) => Number(value))
    .filter(Number.isFinite);

  const maxValue = numericValues[1] || numericValues[0] || 0;

  if (maxValue <= 18000) return "Low";
  if (maxValue <= 25000) return "Medium";
  return "High";
};

const ExploreCities = () => {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState("Goa");
  const [topAttractions, setTopAttractions] = useState([]);
  const [attractionsLoading, setAttractionsLoading] = useState(true);
  const [attractionsError, setAttractionsError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [tripDraft, setTripDraft] = useState(() => getLocalDraftPlacesForCity("Goa"));
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [travelTypeFilter, setTravelTypeFilter] = useState("All");
  const cancelTokenRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New search initiated");
    }

    const searchTerm = query.trim();

    setIsTyping(searchTerm.length > 0);

    if (searchTerm.length < 2) {
      setCities([]);
      setError("");
      setLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      searchCities(searchTerm);
    }, 500);
  }, [query]);

  useEffect(() => {
    setTripDraft(getLocalDraftPlacesForCity(selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    const loadTopAttractions = async () => {
      setAttractionsLoading(true);
      setAttractionsError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/places`, {
          params: { city: selectedCity }
        });

        const attractions = (response.data.attractions || []).slice(0, 8).map((place, index) => ({
          ...place,
          id: place.id || `${selectedCity}-attraction-${index}`,
          category: "attraction",
          description: place.description || "A must-visit stop for your TripWise plan."
        }));

        setTopAttractions(attractions);
      } catch {
        setAttractionsError("Unable to load top attractions right now.");
        setTopAttractions([]);
      } finally {
        setAttractionsLoading(false);
      }
    };

    loadTopAttractions();
  }, [selectedCity]);

  const searchCities = async (searchTerm) => {
    setLoading(true);
    setError("");
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      const response = await axios.get(`${API_BASE_URL}/api/external/cities`, {
        params: { q: searchTerm },
        cancelToken: cancelTokenRef.current.token
      });

      setCities(response.data.cities || []);
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }

      setError("Failed to fetch cities. Please try again.");
      setCities([]);
      setLoading(false);
    }
  };

  const addToTrip = (place) => {
    const nextDrafts = addPlaceToLocalDraftTrip(selectedCity, {
      ...place,
      city: selectedCity
    });
    const activeDraft = nextDrafts.find(
      (draft) => draft.city.toLowerCase() === selectedCity.toLowerCase()
    );
    const savedPlaces = activeDraft
      ? Object.values(activeDraft.itinerary || {}).flatMap((day) => [
          ...(day?.morning || []),
          ...(day?.afternoon || []),
          ...(day?.evening || [])
        ])
      : [];
    setTripDraft(savedPlaces);
  };

  const selectedCityOptions = useMemo(() => curatedCities.map((city) => city.name), []);
  const filteredCuratedCities = useMemo(
    () =>
      curatedCities.filter((city) => {
        const budgetMatch = budgetFilter === "All" || getBudgetBucket(city.budgetRange) === budgetFilter;
        const typeMatch =
          travelTypeFilter === "All" ||
          String(city.travelType || city.tag || "").toLowerCase() === travelTypeFilter.toLowerCase();

        return budgetMatch && typeMatch;
      }),
    [budgetFilter, travelTypeFilter]
  );
  const trendingDestinations = useMemo(
    () => filteredCuratedCities.filter((city) => city.trending).slice(0, 4),
    [filteredCuratedCities]
  );
  const suggestionCities = useMemo(() => {
    const localSuggestionMap = new Map();

    [...curatedCities, ...indiaDestinations].forEach((city, index) => {
      const cityName = city.name || city.city;
      if (!cityName) {
        return;
      }

      const normalizedKey = cityName.toLowerCase();
      if (!localSuggestionMap.has(normalizedKey)) {
        localSuggestionMap.set(normalizedKey, {
          id: city.id || `local-suggestion-${index}`,
          name: cityName,
          region: city.state || city.tag || "India"
        });
      }
    });

    const liveSuggestions = cities.map((city, index) => ({
      id: city.id || `live-suggestion-${index}`,
      name: city.name,
      region: city.region || city.state || "India"
    }));

    const mergedSuggestions = [...liveSuggestions, ...localSuggestionMap.values()];
    const trimmedQuery = query.trim().toLowerCase();

    return mergedSuggestions
      .filter((city) =>
        trimmedQuery.length < 1 ? true : city.name.toLowerCase().includes(trimmedQuery)
      )
      .filter(
        (city, index, list) =>
          index === list.findIndex((item) => item.name.toLowerCase() === city.name.toLowerCase())
      )
      .slice(0, 8);
  }, [cities, query]);

  const handleSuggestionSelect = (cityName) => {
    setQuery(cityName);
    setShowSuggestions(false);
    setIsTyping(false);
    searchCities(cityName);
  };

  return (
    <div className="planx-page">
      <div className="planx-page-content">
        <div className="mx-auto max-w-7xl">
          <section className="planx-panel relative z-20 rounded-[40px] px-8 py-14 sm:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <p className="planx-kicker">
                Explore cities
              </p>
              <h1 className="planx-heading mt-6 text-5xl font-semibold leading-tight text-slate-950 md:text-6xl">
                Discover Your Next
                <span className="block text-[#147ea2]">Adventure in India</span>
              </h1>
              <p className="planx-subtle mx-auto mt-6 max-w-3xl text-lg leading-8">
                Search cities, explore curated destinations, and browse attraction cards that fit
                beautifully into your TripWise plans.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-4xl">
              <div
                ref={suggestionsRef}
                className="relative rounded-[28px] border border-white/10 bg-white/8 p-2 shadow-[0_20px_60px_rgba(16,32,51,0.14)]"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-8 text-white/45">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full rounded-[24px] border border-white/10 bg-[#071e26]/78 py-5 pl-16 pr-6 text-lg text-white outline-none transition placeholder:text-white/45 focus:border-[#1ec7f3]"
                  placeholder="Search for cities... (e.g., Mumbai, Bangalore, Delhi)"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setShowSuggestions(event.target.value.trim().length > 0);
                    setIsTyping(event.target.value.trim().length > 0);
                  }}
                  onFocus={() => setShowSuggestions(query.trim().length > 0)}
                  autoFocus
                />

                {showSuggestions && isTyping && suggestionCities.length > 0 && (
                  <div className="absolute left-2 right-2 top-[calc(100%+12px)] z-30 overflow-hidden rounded-[24px] border border-white/10 bg-[#071e26]/96 shadow-[0_24px_60px_rgba(2,12,18,0.28)]">
                    {suggestionCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSuggestionSelect(city.name)}
                        className="flex w-full items-center justify-between border-b border-white/10 px-5 py-4 text-left transition hover:bg-white/8 last:border-b-0"
                      >
                        <span className="text-base font-semibold text-white">{city.name}</span>
                        <span className="text-sm text-slate-400">{city.region}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="relative z-10 mt-12 space-y-12">
            {query.trim().length < 2 && (
              <div className="space-y-8">
                <div className="planx-panel rounded-[36px] px-8 py-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="planx-kicker">Discovery filters</p>
                      <h2 className="mt-4 text-3xl font-semibold text-white">Search by mood, budget, and trip shape</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        Narrow the discovery set before you commit to planning. These filters shape the inspiration layer for the planner.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Budget
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {budgetOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setBudgetFilter(option)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                budgetFilter === option
                                  ? "bg-[#1ec7f3] text-slate-950"
                                  : "border border-white/10 bg-white/8 text-white"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Travel Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {travelTypeOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setTravelTypeFilter(option)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                travelTypeFilter === option
                                  ? "bg-[#1ec7f3] text-slate-950"
                                  : "border border-white/10 bg-white/8 text-white"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="planx-panel rounded-[36px] px-8 py-12">
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                      <p className="planx-kicker">Trending destinations</p>
                      <h2 className="mt-4 text-4xl font-semibold text-white">Popular right now</h2>
                      <p className="mt-3 max-w-2xl text-base leading-8 text-slate-300">
                        Places with strong inspiration value, good planning flexibility, and higher save potential.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                    {trendingDestinations.map((city) => (
                      <CityCard key={`trending-${city.id}`} city={city} type="trending" />
                    ))}
                  </div>
                </div>

                <div className="planx-panel rounded-[36px] px-8 py-12">
                <div className="mb-12 text-center">
                  <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-[#8edcff]">
                    CURATED FOR YOU
                  </span>
                  <h2 className="planx-heading text-4xl font-semibold text-slate-950">Places You&apos;ll Love</h2>
                  <p className="planx-subtle mx-auto mt-4 max-w-2xl text-lg leading-8">
                    Handpicked destinations that match different travel styles and interests.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCuratedCities.map((city, index) => (
                    <div
                      key={city.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CityCard city={city} type="curated" />
                    </div>
                  ))}
                </div>
                </div>
              </div>
            )}

            <div className="planx-panel rounded-[36px] px-8 py-12">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="planx-kicker">
                    Top Attractions
                  </span>
                  <h2 className="planx-heading mt-4 text-4xl font-semibold text-slate-950">
                    Explore {selectedCity} with the same visual cards as Plan Trip
                  </h2>
                  <p className="planx-subtle mt-3 max-w-2xl text-lg leading-8">
                    Rich attraction cards with imagery, fallback descriptions, and one-click add to trip.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedCityOptions.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => setSelectedCity(cityName)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedCity === cityName
                          ? "bg-[#1ec7f3] text-slate-950"
                          : "border border-[#15283d]/10 bg-white text-slate-700"
                      }`}
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </div>

              {tripDraft.length > 0 && (
                <div className="mt-6 rounded-[24px] border border-[#1ec7f3]/30 bg-[#1ec7f3]/10 px-5 py-4 text-sm font-medium text-[#8edcff]">
                  {tripDraft.length} {tripDraft.length === 1 ? "place" : "places"} added to your trip draft.
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {attractionsLoading &&
                  Array.from({ length: 8 }).map((_, index) => (
                    <PlaceCardSkeleton key={`top-attraction-skeleton-${index}`} />
                  ))}

                {!attractionsLoading &&
                  topAttractions.map((place) => {
                    const alreadyAdded = tripDraft.some((item) => item.id === place.id);

                    return (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        readOnly
                        showEditorActions={false}
                        showDragHandle={false}
                        primaryActionLabel={alreadyAdded ? "Added" : "Add to Trip"}
                        onPrimaryAction={alreadyAdded ? undefined : addToTrip}
                      />
                    );
                  })}
              </div>

              {!attractionsLoading && attractionsError && (
                <div className="mt-6 rounded-[24px] border border-red-300/30 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-100">
                  {attractionsError}
                </div>
              )}
            </div>

            {query.trim().length >= 2 && (
              <div className="planx-panel rounded-[36px] px-8 py-12">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/10 border-t-[#1ec7f3]" />
                    <p className="mt-8 text-xl font-semibold text-white">Searching cities...</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-300/30 bg-red-500/10 py-20 text-center">
                    <p className="text-xl font-semibold text-red-100">{error}</p>
                  </div>
                )}

                {!loading && !error && cities.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
                    <p className="text-2xl font-semibold text-white">No cities found</p>
                    <p className="mt-2 text-lg text-slate-200">
                      Try searching for &quot;{query}&quot; with different spelling.
                    </p>
                  </div>
                )}

                {!loading && cities.length > 0 && (
                  <div className="animate-fadeIn">
                    <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">Search Results</h3>
                        <p className="mt-1 text-sm text-slate-200">
                          Found <span className="font-semibold text-[#8edcff]">{cities.length}</span>{" "}
                          {cities.length === 1 ? "city" : "cities"} matching &quot;{query}&quot;
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {cities.map((city) => (
                        <CityCard key={city.id} city={city} type="search" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <Footer />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in;
        }
      `}</style>
    </div>
  );
};

export default ExploreCities;
