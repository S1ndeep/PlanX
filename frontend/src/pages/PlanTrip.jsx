import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import indiaDestinations from "../data/indiaDestinations.js";
import { API_BASE_URL } from "../utils/auth.js";

const advancedToolLinks = [
  {
    to: "/road-trip",
    title: "Road Trip",
    caption: "Long-route planning"
  },
  {
    to: "/ai-planner",
    title: "AI Planner",
    caption: "Fast itinerary drafts"
  },
  {
    to: "/trip-groups",
    title: "Groups",
    caption: "Shared planning"
  },
  {
    to: "/trip-expenses",
    title: "Expenses",
    caption: "Trip cost tracking"
  }
];

const interestOptions = ["food", "museums", "parks", "landmarks", "shopping"];

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const defaultStartDate = formatDateInput(today);
const defaultEndDate = formatDateInput(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3));

const interestCopy = {
  food: {
    title: "Food",
    description: "Restaurants, cafes, and local dining gems"
  },
  museums: {
    title: "Museums",
    description: "Art, history, and cultural experiences"
  },
  parks: {
    title: "Parks",
    description: "Gardens, green spaces, and scenic escapes"
  },
  landmarks: {
    title: "Landmarks",
    description: "Iconic attractions and must-see city highlights"
  },
  shopping: {
    title: "Shopping",
    description: "Markets, malls, and retail districts"
  }
};

const normalizePreviewAttraction = (place = {}, index = 0) => ({
  id: place.id || `attraction-${index}-${place.name || "place"}`,
  name: place.name || "Unnamed attraction",
  category: place.category || "attraction",
  description: place.description || "",
  address: place.address || "",
  rating: place.rating || "N/A",
  latitude: typeof place.latitude === "number" ? place.latitude : null,
  longitude: typeof place.longitude === "number" ? place.longitude : null,
  interest: place.interest || "landmarks",
  image: place.image || ""
});

const formatInterestList = (interests = []) =>
  interests.length > 0
    ? interests.map((interest) => interestCopy[interest]?.title || interest).join(", ")
    : "General sightseeing";

const buildBudgetSummary = ({
  city,
  days,
  dates,
  interests,
  travelStyle,
  placesPerDay,
  selectedAttractions = []
}) => {
  const attractionNames = selectedAttractions
    .map((place) => place.name)
    .filter(Boolean)
    .slice(0, 6);

  return [
    `Destination: ${city}.`,
    `Duration: ${days} ${days === 1 ? "day" : "days"}.`,
    `Dates: ${dates}.`,
    `Travel style: ${travelStyle}.`,
    `Interests: ${formatInterestList(interests)}.`,
    `Planned pace: ${placesPerDay} ${placesPerDay === 1 ? "place" : "places"} per day.`,
    attractionNames.length > 0
      ? `Selected attractions: ${attractionNames.join(", ")}.`
      : "Selected attractions: none yet."
  ].join(" ");
};

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    city: location.state?.destination || "",
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    interests: ["landmarks", "food"],
    placesPerDay: 3,
    travelStyle: "standard",
    optimizeForBudget: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [spotlight, setSpotlight] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAttractionPrompt, setShowAttractionPrompt] = useState(false);
  const [previewAttractions, setPreviewAttractions] = useState([]);
  const [selectedAttractionIds, setSelectedAttractionIds] = useState([]);
  const [budgetEstimate, setBudgetEstimate] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const citySuggestionsRef = useRef(null);

  const tripDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const differenceMs = end - start;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || differenceMs < 0) {
      return 0;
    }

    return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  }, [formData.endDate, formData.startDate]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSpotlight((current) => (current + 1) % interestOptions.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (value) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(value);

      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== value)
          : [...prev.interests, value]
      };
    });
  };

  const citySuggestions = useMemo(() => {
    const trimmedQuery = formData.city.trim().toLowerCase();
    const uniqueCities = indiaDestinations.filter(
      (city, index, list) =>
        index === list.findIndex((item) => item.city.toLowerCase() === city.city.toLowerCase())
    );

    if (!trimmedQuery) {
      return uniqueCities.slice(0, 8);
    }

    return uniqueCities
      .filter((city) => city.city.toLowerCase().includes(trimmedQuery))
      .slice(0, 8);
  }, [formData.city]);

  const handleCitySelect = (cityName) => {
    updateField("city", cityName);
    setShowSuggestions(false);
  };

  const validatePlanForm = () => {
    setError("");

    if (!formData.startDate || !formData.endDate) {
      setError("Please select both a start date and an end date.");
      return false;
    }

    if (formData.endDate < formData.startDate) {
      setError("End date must be after start date.");
      return false;
    }

    if (tripDays < 1) {
      setError("Please choose an end date that is at least one day after the start date.");
      return false;
    }

    if (!formData.city.trim()) {
      setError("Please choose a city before generating your itinerary.");
      return false;
    }

    return true;
  };

  const requestBudgetEstimate = async (selectedAttractions = []) => {
    if (!validatePlanForm()) {
      return null;
    }

    setBudgetLoading(true);
    setBudgetError("");

    try {
      const selectedPlaces = Array.isArray(selectedAttractions) ? selectedAttractions : [];
      const response = await axios.post(`${API_BASE_URL}/api/travel/budget`, {
        city: formData.city.trim(),
        days: tripDays,
        dates: `${formData.startDate} to ${formData.endDate}`,
        totalPlaces:
          selectedPlaces.length > 0
            ? selectedPlaces.length
            : Math.max(formData.placesPerDay * tripDays, 1),
        placesPerDay: formData.placesPerDay,
        itinerarySummary: buildBudgetSummary({
          city: formData.city.trim(),
          days: tripDays,
          dates: `${formData.startDate} to ${formData.endDate}`,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          placesPerDay: formData.placesPerDay,
          selectedAttractions: selectedPlaces
        }),
        destinations: [
          formData.city.trim(),
          ...selectedPlaces.map((place) => place.name).filter(Boolean)
        ]
      });

      const nextBudgetEstimate = response.data?.budgetEstimate || null;
      setBudgetEstimate(nextBudgetEstimate);
      return nextBudgetEstimate;
    } catch (budgetRequestError) {
      setBudgetError(
        budgetRequestError.response?.data?.message || "Failed to generate budget right now."
      );
      return null;
    } finally {
      setBudgetLoading(false);
    }
  };

  const generateItinerary = async (selectedAttractions = []) => {
    setLoading(true);

    try {
      const nextBudgetEstimate = await requestBudgetEstimate(selectedAttractions);
      const response = await axios.post(`${API_BASE_URL}/api/places`, {
        city: formData.city.trim(),
        days: tripDays,
        interests: formData.interests,
        placesPerDay: formData.placesPerDay,
        selectedAttractions
      });

      setLoading(false);
      setShowAttractionPrompt(false);
      navigate("/itinerary", {
        state: {
          ...response.data,
          travelStyle: formData.travelStyle,
          optimizeForBudget: formData.optimizeForBudget,
          budgetEstimate: nextBudgetEstimate,
          startDate: formData.startDate,
          endDate: formData.endDate,
          dates: `${formData.startDate} to ${formData.endDate}`
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to generate itinerary. Please try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePlanForm()) {
      return;
    }

    setPreviewLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/places`, {
        params: {
          city: formData.city.trim()
        }
      });

      const attractions = (response.data?.attractions || []).map(normalizePreviewAttraction);
      setPreviewAttractions(attractions);
      setSelectedAttractionIds([]);
      setShowAttractionPrompt(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attractions. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleAttractionSelection = (placeId) => {
    setSelectedAttractionIds((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId]
    );
  };

  const handleGenerateWithSelections = () => {
    const selectedAttractions = previewAttractions.filter((place) =>
      selectedAttractionIds.includes(place.id)
    );

    generateItinerary(selectedAttractions);
  };

  const handleSkipAttractions = () => {
    generateItinerary([]);
  };

  return (
    <>
      {showAttractionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/60 bg-[rgba(255,255,255,0.92)] shadow-[0_34px_120px_rgba(15,23,42,0.22)] backdrop-blur-[24px]">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                    Before generating
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                    Add any attractions you definitely want
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    We fetched the available attractions for {formData.city.trim()}. Select any must-visit stops,
                    or skip this step and let TripWise plan automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttractionPrompt(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  disabled={loading}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[calc(88vh-165px)] overflow-y-auto px-6 py-6 sm:px-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {previewAttractions.length > 0
                    ? `Showing ${previewAttractions.length} attractions`
                    : "No attractions were fetched for this city right now."}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#eaf9ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#147ea2]">
                    {selectedAttractionIds.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      requestBudgetEstimate(
                        previewAttractions.filter((place) => selectedAttractionIds.includes(place.id))
                      )
                    }
                    disabled={budgetLoading}
                    className="rounded-full border border-[#c9e9f3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#147ea2] transition hover:bg-[#f6fdff] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {budgetLoading ? "Updating budget..." : "Update Budget"}
                  </button>
                </div>
              </div>

              {previewAttractions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {previewAttractions.map((place) => {
                    const isSelected = selectedAttractionIds.includes(place.id);

                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => toggleAttractionSelection(place.id)}
                        className={`rounded-[28px] border p-5 text-left transition ${
                          isSelected
                            ? "border-[#59cef0] bg-[#f0fbff] shadow-[0_18px_40px_rgba(30,199,243,0.14)]"
                            : "border-slate-200 bg-white hover:border-[#b7dfee] hover:bg-[#f8fdff]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">{place.name}</p>
                            <p className="mt-1 text-sm capitalize text-slate-500">
                              {place.category}
                              {place.rating !== "N/A" ? ` • ${place.rating} rating` : ""}
                            </p>
                          </div>
                          <span
                            className={`mt-1 h-6 w-6 rounded-full border ${
                              isSelected ? "border-[#1ec7f3] bg-[#1ec7f3]" : "border-slate-300 bg-white"
                            }`}
                          />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {place.address || place.description || "Add this attraction to your itinerary pool."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  You can continue without pre-selecting attractions.
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-6 py-5 backdrop-blur sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={handleSkipAttractions}
                disabled={loading}
                className="rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Generating..." : "Skip selection"}
              </button>
              <button
                type="button"
                onClick={handleGenerateWithSelections}
                disabled={loading}
                className="rounded-[18px] bg-[#071425] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.22)] transition hover:bg-[#11233d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Generating your itinerary..."
                  : selectedAttractionIds.length > 0
                    ? `Continue with ${selectedAttractionIds.length} selected`
                    : "Continue to itinerary"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative min-h-screen overflow-hidden px-4 pb-14 pt-12 sm:px-6 lg:px-10 lg:pt-14">
      <img
        src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80"
        alt="Aerial tropical shoreline with forest and turquoise water"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,16,26,0.54)_0%,rgba(5,28,34,0.62)_24%,rgba(247,242,234,0.92)_52%,rgba(244,238,229,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(30,199,243,0.12),transparent_18%)]" />

      <div className="relative z-10 mx-auto grid max-w-[1450px] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[42px] border border-white/55 bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_32px_120px_rgba(15,23,42,0.14)] backdrop-blur-[28px] xl:p-12">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#dff7ff] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#147ea2]">
              TripWise Planner
            </span>
            <span className="rounded-full bg-[#1d2437] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
              TravelAdvisor + Geoapify
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl lg:text-[4rem] lg:leading-[1.03]">
            Build a city itinerary that feels curated, not generic.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-600">
            Pick your destination, choose how many days you have, and let TripWise shape top attractions plus food and local interests into a balanced day-by-day route.
          </p>

          <div className="mt-8 rounded-[24px] border border-[#d6ecf4] bg-white/70 p-4 backdrop-blur-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#147ea2]">
                Need a specific tool?
              </p>
              <Link
                to="/road-trip"
                className="rounded-full border border-[#b5ddec] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#147ea2] transition hover:bg-[#f3fbff]"
              >
                Open Modules
              </Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {advancedToolLinks.map((tool) => (
                <Link
                  key={tool.title}
                  to={tool.to}
                  className="rounded-2xl border border-white/70 bg-[#f8fdff] px-4 py-3 transition hover:border-[#b9e7f4] hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{tool.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{tool.caption}</p>
                </Link>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-9">
            <div className="grid gap-5 lg:grid-cols-4">
              <div ref={citySuggestionsRef} className="relative">
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  City
                </label>
                <input
                  className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  type="text"
                  placeholder="Jaipur, Mumbai, Bengaluru..."
                  value={formData.city}
                  onChange={(event) => {
                    updateField("city", event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  required
                />

                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[22px] border border-[#cfe9f1] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
                    {citySuggestions.map((city) => (
                      <button
                        key={city.city}
                        type="button"
                        onClick={() => handleCitySelect(city.city)}
                        className="block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-[#f2fbfd] last:border-b-0"
                      >
                        <span className="font-medium text-slate-900">{city.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Start date
                </label>
                <input
                  type="date"
                  className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  value={formData.startDate}
                  min={defaultStartDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  End date
                </label>
                <input
                  type="date"
                  className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  value={formData.endDate}
                  min={formData.startDate || defaultStartDate}
                  onChange={(event) => updateField("endDate", event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Places per day
                </label>
                <select
                  className="w-full rounded-[22px] border border-[#d8dfeb] bg-white/90 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  value={formData.placesPerDay}
                  onChange={(event) => updateField("placesPerDay", Number(event.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "place" : "places"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.46)] px-5 py-4 text-sm text-slate-600 backdrop-blur-md">
              <span className="font-semibold text-slate-900">Trip Duration:</span>{" "}
              {tripDays > 0
                ? `${tripDays} ${tripDays === 1 ? "Day" : "Days"} with up to ${
                    formData.placesPerDay
                  } ${formData.placesPerDay === 1 ? "place" : "places"} each day`
                : "Select valid dates"}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Interests
                </label>
                <p className="text-sm text-slate-500">
                  Choose up to shape your route mix
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {interestOptions.map((interest) => {
                  const active = formData.interests.includes(interest);

                  return (
                    <label
                      key={interest}
                      className={`group cursor-pointer rounded-[28px] border p-5 transition ${
                        active
                          ? "border-[#8edcff] bg-[#f2fcff] shadow-[0_18px_42px_rgba(30,199,243,0.14)]"
                          : "border-[#dbe2ea] bg-white/92 hover:border-[#b7cfe0] hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => toggleInterest(interest)}
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold capitalize text-slate-900">
                            {interestCopy[interest].title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {interestCopy[interest].description}
                          </p>
                        </div>
                        <div
                          className={`mt-1 h-6 w-6 rounded-full border transition ${
                            active ? "border-[#1ec7f3] bg-[#1ec7f3]" : "border-[#bfd2e3] bg-white"
                          }`}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-[22px] bg-[#071425] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,20,37,0.22)] transition hover:bg-[#11233d] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading || previewLoading}
            >
              {previewLoading
                ? "Loading attractions..."
                : loading
                  ? "Generating your itinerary..."
                  : "Generate Itinerary"}
            </button>

            {(loading || previewLoading) && (
              <div className="flex flex-col items-center rounded-[28px] border border-[#c9f1fb] bg-[#effcff]/90 px-6 py-8 text-center">
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#d2f5ff]" />
                  <div className="absolute inset-2 animate-spin rounded-full border-4 border-[#c2effd] border-t-[#1ec7f3]" />
                </div>
                <p className="mt-5 text-base font-semibold text-[#147ea2]">
                  {previewLoading
                    ? "Pulling attractions so you can choose must-visit spots."
                    : "Pulling fresh places and arranging your route."}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>

        <aside className="grid gap-7">
          <div className="overflow-hidden rounded-[42px] border border-white/15 bg-[rgba(3,9,28,0.68)] p-8 text-white shadow-[0_34px_120px_rgba(2,9,28,0.28)] backdrop-blur-[24px] xl:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#69d9f7]">
              This planner creates
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[30px] border border-white/15 bg-[rgba(255,255,255,0.08)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                <p className="text-sm text-slate-300">Morning</p>
                <p className="mt-3 text-lg font-semibold leading-8">Landmarks and outdoor anchors</p>
              </div>
              <div className="rounded-[30px] border border-white/15 bg-[rgba(255,255,255,0.08)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                <p className="text-sm text-slate-300">Afternoon</p>
                <p className="mt-3 text-lg font-semibold leading-8">Museums, culture, and shopping pockets</p>
              </div>
              <div className="rounded-[30px] border border-white/15 bg-[rgba(255,255,255,0.08)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                <p className="text-sm text-slate-300">Evening</p>
                <p className="mt-3 text-lg font-semibold leading-8">Food-led stops and memorable finishes</p>
              </div>
            </div>
          </div>

          <div className="rounded-[42px] border border-white/55 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur-[24px] xl:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Interest spotlight
            </p>
            <h2 className="mt-4 text-4xl font-semibold capitalize tracking-tight text-slate-950">
              {interestCopy[interestOptions[spotlight]].title}
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              {interestCopy[interestOptions[spotlight]].description}
            </p>
            <div className="mt-8 flex gap-2">
              {interestOptions.map((interest, index) => (
                <span
                  key={interest}
                  className={`h-2 flex-1 rounded-full ${
                    spotlight === index ? "bg-[#1ec7f3]" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
      </section>
    </>
  );
};

export default PlanTrip;
