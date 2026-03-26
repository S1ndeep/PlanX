import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import indiaDestinations from "../data/indiaDestinations.js";

const API_BASE_URL = "http://localhost:5000";
const interestOptions = ["food", "museums", "parks", "landmarks", "shopping"];

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDaysToDate = (dateString, daysToAdd) => {
  const baseDate = new Date(dateString);
  if (Number.isNaN(baseDate.getTime())) {
    return dateString;
  }

  baseDate.setDate(baseDate.getDate() + Math.max(1, Number(daysToAdd) || 1));
  return formatDateInput(baseDate);
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

const travelStyles = [
  {
    id: "basic",
    title: "Budget",
    description: "Value-first planning with tighter spending assumptions."
  },
  {
    id: "standard",
    title: "Standard",
    description: "Balanced comfort, movement, and stay quality."
  },
  {
    id: "premium",
    title: "Premium",
    description: "Higher-comfort pacing with premium trip assumptions."
  }
];

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

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    city: location.state?.destination || "",
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    interests: ["landmarks", "food"],
    placesPerDay: 3,
    days: 3,
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

  const handleStartDateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      startDate: value,
      endDate: addDaysToDate(value, prev.days)
    }));
  };

  const handleEndDateChange = (value) => {
    const start = new Date(formData.startDate);
    const end = new Date(value);
    const nextDays =
      !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start
        ? Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        : 0;

    setFormData((prev) => ({
      ...prev,
      endDate: value,
      days: nextDays || prev.days
    }));
  };

  const handleDaysChange = (value) => {
    const nextDays = Math.max(1, Number(value) || 1);
    setFormData((prev) => ({
      ...prev,
      days: nextDays,
      endDate: addDaysToDate(prev.startDate, nextDays)
    }));
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

  const generateItinerary = async (selectedAttractions = []) => {
    setLoading(true);

    try {
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-8">
        <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(7,30,38,0.94)] shadow-[0_34px_120px_rgba(15,23,42,0.22)] backdrop-blur-[24px]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                    Before generating
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                    Add any attractions you definitely want
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    We fetched the available attractions for {formData.city.trim()}. Select any must-visit stops,
                    or skip this step and let TripWise plan automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttractionPrompt(false)}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                  disabled={loading}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[calc(88vh-165px)] overflow-y-auto px-6 py-6 sm:px-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  {previewAttractions.length > 0
                    ? `Showing ${previewAttractions.length} attractions`
                    : "No attractions were fetched for this city right now."}
                </p>
                <span className="rounded-full bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8edcff]">
                  {selectedAttractionIds.length} selected
                </span>
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
                            ? "border-[#59cef0] bg-[#0b3b43]/70 shadow-[0_18px_40px_rgba(30,199,243,0.14)]"
                            : "border-white/10 bg-white/6 hover:border-[#b7dfee] hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">{place.name}</p>
                            <p className="mt-1 text-sm capitalize text-slate-300">
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
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {place.address || place.description || "Add this attraction to your itinerary pool."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/6 px-5 py-10 text-center text-sm text-slate-400">
                  You can continue without pre-selecting attractions.
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-white/10 bg-[#071e26]/94 px-6 py-5 backdrop-blur sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={handleSkipAttractions}
                disabled={loading}
                className="rounded-[18px] border border-white/10 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-70"
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
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,20,30,0.75),rgba(5,20,30,0.95))]" />
      <div className="planx-page-content grid max-w-[1450px] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[42px] border border-white/10 bg-[rgba(10,25,35,0.9)] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-[14px] xl:p-12">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="planx-kicker">
              TripWise Planner
            </span>
            <span className="rounded-full bg-[#1d2437] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
              AI Trip Engine
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#F5FBFF] [text-shadow:0px_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-[4rem] lg:leading-[1.03]">
            Build a city itinerary that feels curated, not generic.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-[#B8D3DC] [text-shadow:0px_2px_12px_rgba(0,0,0,0.45)]">
            Pick your destination, choose how many days you have, and let TripWise shape top attractions plus food and local interests into a balanced day-by-day route.
          </p>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            <div className="rounded-[24px] border border-[#1ec8a5]/40 bg-[linear-gradient(135deg,rgba(30,200,165,0.15),rgba(45,169,255,0.15))] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#147ea2]">
                AI Assistant
              </p>
              <p className="mt-3 text-lg font-semibold text-[#F5FBFF]">Generating your optimized trip</p>
              <p className="mt-3 text-sm leading-7 text-[#B8D3DC]">
                TripWise combines attractions, routing logic, interests, and pace into one planning flow.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,35,45,0.95)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FAAB5]">
                Budget Integration
              </p>
              <p className="mt-3 text-lg font-semibold text-[#F5FBFF]">Basic to Premium estimates</p>
              <p className="mt-3 text-sm leading-7 text-[#B8D3DC]">
                After itinerary generation, the workspace will show AI budget tiers, insights, and cautions.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,35,45,0.95)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FAAB5]">
                Smart Control
              </p>
              <p className="mt-3 text-lg font-semibold text-[#F5FBFF]">Optimize for lower budget</p>
              <p className="mt-3 text-sm leading-7 text-[#B8D3DC]">
                Bias the trip toward a more efficient daily structure before you reach the itinerary editor.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-9">
            <div className="grid gap-5 lg:grid-cols-5">
              <div ref={citySuggestionsRef} className="relative">
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  City
                </label>
                <input
                  className="w-full rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-base text-[#EAF6F9] outline-none transition placeholder:text-[#8FAAB5] focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
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
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(10,25,35,0.96)] shadow-[0_24px_50px_rgba(15,23,42,0.3)]">
                    {citySuggestions.map((city) => (
                      <button
                        key={city.city}
                        type="button"
                        onClick={() => handleCitySelect(city.city)}
                        className="block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/8 last:border-b-0"
                      >
                        <span className="font-medium text-[#EAF6F9]">{city.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  Start date
                </label>
                <input
                  type="date"
                  className="w-full rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-base text-[#EAF6F9] outline-none transition focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
                  value={formData.startDate}
                  min={defaultStartDate}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  End date
                </label>
                <input
                  type="date"
                  className="w-full rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-base text-[#EAF6F9] outline-none transition focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
                  value={formData.endDate}
                  min={formData.startDate || defaultStartDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  Number of days
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  className="w-full rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-base text-[#EAF6F9] outline-none transition focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
                  value={formData.days}
                  onChange={(event) => handleDaysChange(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  Places per day
                </label>
                <select
                  className="w-full rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-base text-[#EAF6F9] outline-none transition focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
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

            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                    Travel style
                  </label>
                  <p className="text-sm text-[#8FAAB5]">
                    Sets the tone for the budget panel
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {travelStyles.map((style) => {
                    const active = formData.travelStyle === style.id;

                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateField("travelStyle", style.id)}
                        className={`rounded-[28px] border p-5 text-left transition ${
                          active
                            ? "border-transparent bg-[linear-gradient(135deg,#1EC8A5,#2DA9FF)] text-[#021014] shadow-[0_10px_30px_rgba(45,169,255,0.3)]"
                            : "border border-white/20 bg-transparent text-[#EAF6F9] hover:border-white/30 hover:bg-white/5"
                        }`}
                      >
                        <p className={`text-lg font-semibold ${active ? "text-[#021014]" : "text-[#F5FBFF]"}`}>{style.title}</p>
                        <p className={`mt-2 text-sm leading-6 ${active ? "text-[#07323a]" : "text-[#B8D3DC]"}`}>{style.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[rgba(10,25,35,0.9)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  AI controls
                </p>
                <label className="mt-4 flex items-start gap-3 rounded-[20px] border border-white/10 bg-[rgba(15,35,45,0.95)] px-4 py-4 text-sm text-[#D6EAF2]">
                  <input
                    type="checkbox"
                    checked={formData.optimizeForBudget}
                    onChange={(event) => updateField("optimizeForBudget", event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span>
                    <span className="block font-semibold text-[#F5FBFF]">Optimize for lower budget</span>
                    <span className="mt-1 block text-[#9FBAC4]">
                      Use a more efficient trip structure before itinerary generation.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,35,45,0.95)] px-5 py-4 text-sm text-[#B8D3DC] backdrop-blur-md">
              <span className="font-semibold text-[#F5FBFF]">Trip Duration:</span>{" "}
              {tripDays > 0
                ? `${tripDays} ${tripDays === 1 ? "Day" : "Days"} with up to ${
                    formData.placesPerDay
                  } ${formData.placesPerDay === 1 ? "place" : "places"} each day`
                : "Select valid dates"}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#8FAAB5]">
                  Interests
                </label>
                <p className="text-sm text-[#8FAAB5]">
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
                          ? "border-[#1ec8a5]/40 bg-[linear-gradient(135deg,rgba(30,200,165,0.15),rgba(45,169,255,0.15))] shadow-[0_18px_42px_rgba(30,199,243,0.14)]"
                          : "border-white/10 bg-[rgba(15,35,45,0.95)] hover:border-white/20 hover:shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
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
                          <p className="text-lg font-semibold capitalize text-[#F5FBFF]">
                            {interestCopy[interest].title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#9FBAC4]">
                            {interestCopy[interest].description}
                          </p>
                        </div>
                        <div
                          className={`mt-1 h-6 w-6 rounded-full border transition ${
                            active ? "border-[#1ec7f3] bg-[#1ec7f3]" : "border-white/25 bg-transparent"
                          }`}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#1EC8A5,#2DA9FF)] px-6 py-4 text-base font-semibold text-[#021014] shadow-[0_10px_30px_rgba(45,169,255,0.3)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
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
              <div className="flex flex-col items-center rounded-[28px] border border-white/10 bg-[rgba(10,25,35,0.9)] px-6 py-8 text-center">
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#d2f5ff]" />
                  <div className="absolute inset-2 animate-spin rounded-full border-4 border-[#c2effd] border-t-[#1ec7f3]" />
                </div>
                <p className="mt-5 text-base font-semibold text-[#D6EAF2]">
                  {previewLoading
                    ? "Pulling attractions so you can choose must-visit spots."
                    : "Generating your optimized trip..."}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                {error}
              </div>
            )}
          </form>
        </div>

        <aside className="grid gap-7">
          <div className="overflow-hidden rounded-[42px] border border-white/10 bg-[rgba(10,25,35,0.9)] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-[14px] xl:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#69d9f7]">
              This planner creates
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[30px] border border-white/10 bg-[rgba(20,40,50,0.85)] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-md transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                <p className="text-sm text-[#8FAAB5]">Morning</p>
                <p className="mt-3 text-lg font-semibold leading-8 text-[#F5FBFF]">Landmarks and outdoor anchors</p>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[rgba(20,40,50,0.85)] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-md transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                <p className="text-sm text-[#8FAAB5]">Afternoon</p>
                <p className="mt-3 text-lg font-semibold leading-8 text-[#F5FBFF]">Museums, culture, and shopping pockets</p>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[rgba(20,40,50,0.85)] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-md transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                <p className="text-sm text-[#8FAAB5]">Evening</p>
                <p className="mt-3 text-lg font-semibold leading-8 text-[#F5FBFF]">Food-led stops and memorable finishes</p>
              </div>
            </div>
          </div>

          <div className="rounded-[42px] border border-white/10 bg-[rgba(10,25,35,0.9)] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-[14px] xl:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8FAAB5]">
              Interest spotlight
            </p>
            <h2 className="mt-4 text-4xl font-semibold capitalize tracking-tight text-[#F5FBFF] [text-shadow:0px_2px_12px_rgba(0,0,0,0.6)]">
              {interestCopy[interestOptions[spotlight]].title}
            </h2>
            <p className="mt-3 text-base leading-8 text-[#B8D3DC]">
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
