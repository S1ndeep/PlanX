import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddPlaceModal from "./AddPlaceModal.jsx";
import ItineraryEditor from "./ItineraryEditor.jsx";
import PlacesMap from "./PlacesMap.jsx";
import WeatherCards from "./WeatherCards.jsx";

const API_BASE_URL = "http://localhost:5000";

const slotKeyMap = {
  Morning: "morning",
  Afternoon: "afternoon",
  Evening: "evening"
};

const inferCategory = (place = {}) => {
  if (place.category?.includes?.("restaurant")) return "restaurant";
  if (place.category?.includes?.("cafe")) return "cafe";
  if (place.interest === "museums") return "museum";
  if (place.interest === "parks") return "park";
  return "attraction";
};

const toFallbackImage = (placeName = "travel destination") =>
  `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(placeName)}`;

const normalizePlaceName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getPlaceDedupKey = (place = {}) => {
  const normalizedName = normalizePlaceName(place.name || "");
  const latitude =
    typeof place.latitude === "number" ? place.latitude.toFixed(3) : "";
  const longitude =
    typeof place.longitude === "number" ? place.longitude.toFixed(3) : "";

  return `${normalizedName}|${latitude}:${longitude}`;
};

const normalizeSuggestedPlace = (place = {}, index = 0) => ({
  ...place,
  id: place.id || `suggested-${index}-${place.name || "place"}`,
  category: inferCategory(place),
  description: place.description || place.address || "",
  image: place.image || toFallbackImage(place.name)
});

const slotOrder = ["morning", "afternoon", "evening"];
const slotLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening"
};
const severeWeatherIcons = new Set(["rain", "drizzle", "storm", "snow", "fog"]);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildEditorState = (itinerary = []) => {
  if (!itinerary) return {};

  if (!Array.isArray(itinerary)) {
    return itinerary;
  }

  return itinerary.reduce((accumulator, day) => {
    const dayKey = `day${day.day}`;

    accumulator[dayKey] = {
      label: `Day ${day.day}`,
      morning: [],
      afternoon: [],
      evening: []
    };

    (day.slots || []).forEach((slot, slotIndex) => {
      const slotKey = slotKeyMap[slot.timeOfDay];

      if (!slotKey || !slot.place) {
        return;
      }

      accumulator[dayKey][slotKey].push({
        ...slot.place,
        id: slot.place.id || `${dayKey}-${slotKey}-${slotIndex}`,
        category: inferCategory(slot.place),
        description: slot.description
      });
    });

    return accumulator;
  }, {});
};

const flattenItineraryPlaces = (itinerary) =>
  Object.keys(itinerary)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .flatMap((dayKey) => slotOrder.flatMap((slot) => itinerary[dayKey][slot] || []));

const rebuildItineraryFromTemplate = (template, orderedPlaces) => {
  const rebuilt = structuredClone(template);
  const capacities = [];

  Object.keys(template)
    .sort((firstKey, secondKey) => firstKey.localeCompare(secondKey, undefined, { numeric: true }))
    .forEach((dayKey) => {
      slotOrder.forEach((slot) => {
        capacities.push({
          dayKey,
          slot,
          count: template[dayKey][slot].length
        });
        rebuilt[dayKey][slot] = [];
      });
    });

  let cursor = 0;

  capacities.forEach((capacity) => {
    for (let index = 0; index < capacity.count; index += 1) {
      if (!orderedPlaces[cursor]) {
        return;
      }
      rebuilt[capacity.dayKey][capacity.slot].push(orderedPlaces[cursor]);
      cursor += 1;
    }
  });

  return rebuilt;
};

const inferPlacesPerDay = (itinerary = {}) =>
  Math.max(
    1,
    ...Object.values(itinerary).map((day) =>
      slotOrder.reduce((count, slot) => count + ((day?.[slot] || []).length), 0)
    )
  );

const buildBudgetDestinations = (places = []) =>
  places
    .map((place) => String(place.name || "").trim())
    .filter(Boolean);

const buildItinerarySummaryText = (itinerary = {}, dayOptions = []) =>
  dayOptions
    .map(({ value, label }) => {
      const day = itinerary[value] || {};
      const stops = slotOrder
        .flatMap((slot) => (day[slot] || []).map((place) => place.name).filter(Boolean))
        .join(", ");

      return stops ? `${label}: ${stops}` : `${label}: No stops planned`;
    })
    .join("\n");

const BudgetTierCard = ({ label, tier, tone }) => (
  <div className={`rounded-[24px] border ${tone.border} ${tone.background} p-5`}>
    <div className="flex items-center justify-between gap-3">
      <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${tone.kicker}`}>
        {label}
      </p>
      <p className="text-xs text-slate-500">{tier.per_day} / day</p>
    </div>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{tier.total}</p>
    <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
      <p>Stay: {tier.stay}</p>
      <p>Food: {tier.food}</p>
      <p>Transport: {tier.transport}</p>
      <p>Activities: {tier.activities}</p>
      <p className="sm:col-span-2">Misc: {tier.misc}</p>
    </div>
  </div>
);

const budgetTabs = [
  { id: "basic", label: "Basic" },
  { id: "standard", label: "Standard" },
  { id: "premium", label: "Premium" }
];

const getWeatherSeverityLabel = (forecastDay = {}) => {
  if (
    severeWeatherIcons.has(String(forecastDay.icon || "").toLowerCase()) ||
    Number(forecastDay.weatherCode) >= 80
  ) {
    return "bad";
  }

  if (String(forecastDay.icon || "").toLowerCase() === "cloudy") {
    return "watch";
  }

  return "good";
};

const buildPrintableMarkup = ({
  city,
  itinerary,
  dayOptions,
  routeData,
  weather,
  placesPerDay
}) => {
  const daysMarkup = dayOptions
    .map(({ value: dayKey, label }) => {
      const day = itinerary[dayKey] || {};
      const slotMarkup = slotOrder
        .map((slot) => {
          const places = day[slot] || [];

          if (places.length === 0) {
            return "";
          }

          const placesMarkup = places
            .map(
              (place, index) => `
                <div class="place">
                  <div class="place-header">
                    <h4>${escapeHtml(place.name || `Stop ${index + 1}`)}</h4>
                    <span>${escapeHtml(place.category || "Place")}</span>
                  </div>
                  ${place.description ? `<p>${escapeHtml(place.description)}</p>` : ""}
                  ${place.address ? `<p class="muted">${escapeHtml(place.address)}</p>` : ""}
                </div>
              `
            )
            .join("");

          return `
            <section class="slot">
              <div class="slot-label">${slotLabels[slot]}</div>
              ${placesMarkup}
            </section>
          `;
        })
        .join("");

      return `
        <section class="day">
          <div class="day-header">
            <h2>${escapeHtml(label)}</h2>
            <span>${slotOrder.reduce((count, slot) => count + ((day[slot] || []).length), 0)} stops</span>
          </div>
          <div class="slot-grid">${slotMarkup || '<p class="muted">No stops planned.</p>'}</div>
        </section>
      `;
    })
    .join("");

  const weatherMarkup =
    weather.length > 0
      ? `
        <section class="panel">
          <h3>Weather</h3>
          <div class="weather-grid">
            ${weather
              .map(
                (entry) => `
                  <div class="weather-card">
                    <strong>${escapeHtml(entry.day || entry.date || "Day")}</strong>
                    <span>${escapeHtml(entry.summary || entry.condition || "Forecast available")}</span>
                    ${
                      entry.temperatureC || entry.temp
                        ? `<span>${escapeHtml(`${entry.temperatureC ?? entry.temp}${
                            entry.temperatureC ? " degrees C" : ""
                          }`)}</span>`
                        : ""
                    }
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `
      : "";

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(city || "TripWise Itinerary")} PDF</title>
      <style>
        :root {
          color-scheme: light;
          --ink: #102033;
          --muted: #5f738a;
          --line: #d8e3ec;
          --panel: #f5f8fb;
          --accent: #117499;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Segoe UI", Arial, sans-serif;
          color: var(--ink);
          background: white;
          padding: 32px;
        }
        .hero {
          padding: 24px 28px;
          border-radius: 24px;
          background: linear-gradient(135deg, #0b3b43, #117499);
          color: white;
        }
        .hero h1 {
          margin: 12px 0 8px;
          font-size: 32px;
        }
        .hero p {
          margin: 0;
          line-height: 1.6;
          color: rgba(255,255,255,0.86);
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        .summary-card, .panel {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px;
          background: var(--panel);
        }
        .summary-card span, .muted {
          color: var(--muted);
        }
        .summary-card strong {
          display: block;
          margin-top: 8px;
          font-size: 24px;
        }
        .day {
          margin-top: 22px;
          page-break-inside: avoid;
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 20px;
        }
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .day-header h2, .panel h3, .place h4 {
          margin: 0;
        }
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .slot {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 14px;
          background: white;
        }
        .slot-label {
          display: inline-block;
          margin-bottom: 12px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #eaf6fb;
          color: var(--accent);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
        }
        .place {
          padding: 12px 0;
          border-top: 1px solid #edf2f7;
        }
        .place:first-of-type {
          border-top: 0;
          padding-top: 0;
        }
        .place-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: baseline;
        }
        .place-header span {
          color: var(--muted);
          font-size: 12px;
          text-transform: capitalize;
        }
        .place p {
          margin: 8px 0 0;
          line-height: 1.5;
        }
        .weather-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .weather-card {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 12px;
          background: white;
        }
        .weather-card span, .weather-card strong {
          display: block;
          margin-top: 6px;
        }
        @media print {
          body { padding: 18px; }
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          window.setTimeout(() => {
            window.print();
          }, 250);
        });
      </script>
    </head>
    <body>
      <section class="hero">
        <div>TripWise itinerary</div>
        <h1>${escapeHtml(city || "Your trip")}</h1>
        <p>Day-by-day route plan ready to save or share as a PDF.</p>
      </section>
      <section class="summary">
        <div class="summary-card"><span>Days</span><strong>${dayOptions.length}</strong></div>
        <div class="summary-card"><span>Stops</span><strong>${Object.values(itinerary).reduce(
          (count, day) => count + slotOrder.reduce((sum, slot) => sum + ((day?.[slot] || []).length), 0),
          0
        )}</strong></div>
        <div class="summary-card"><span>Route</span><strong>${
          routeData.distanceKm ? `${routeData.distanceKm} km` : "Planned"
        }</strong></div>
        <div class="summary-card"><span>Per day</span><strong>${placesPerDay}</strong></div>
      </section>
      ${daysMarkup}
      ${weatherMarkup}
    </body>
  </html>`;
};
const TripWorkspace = ({ initialData, readOnly = false }) => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    isOpen: false,
    dayKey: "day1",
    slot: "morning"
  });
  const [itinerary, setItinerary] = useState(() => buildEditorState(initialData?.itinerary || []));
  const [routeData, setRouteData] = useState({ geometry: [], distanceKm: 0, durationMinutes: 0, legs: [] });
  const [weather, setWeather] = useState(initialData?.weather || []);
  const [saveState, setSaveState] = useState({ saving: false, message: "", shareUrl: "" });
  const [plannerState, setPlannerState] = useState({
    optimizing: false,
    autoPlanning: false,
    weatherReplanning: false,
    message: ""
  });
  const [budgetState, setBudgetState] = useState({
    loading: false,
    error: "",
    estimate: null
  });
  const [activeBudgetTab, setActiveBudgetTab] = useState(
    String(initialData?.travelStyle || "standard").toLowerCase()
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [weatherReplanSummary, setWeatherReplanSummary] = useState([]);

  const city = initialData?.city || "";
  const places = initialData?.places || [];
  const interests = initialData?.interests || [];
  const coordinates = initialData?.coordinates || null;
  const placesPerDay = initialData?.placesPerDay || inferPlacesPerDay(itinerary);

  const highlightedPlaces = useMemo(
    () => flattenItineraryPlaces(itinerary),
    [itinerary]
  );

  const itineraryDestinations = useMemo(
    () => buildBudgetDestinations(highlightedPlaces),
    [highlightedPlaces]
  );

  const dayOptions = useMemo(
    () =>
      Object.entries(itinerary).map(([dayKey, dayValue]) => ({
        value: dayKey,
        label: dayValue.label
      })),
    [itinerary]
  );

  const suggestedPlaces = useMemo(
    () => places.map((place, index) => normalizeSuggestedPlace(place, index)),
    [places]
  );

  const totalStops = highlightedPlaces.length;
  const itinerarySummary = useMemo(
    () => buildItinerarySummaryText(itinerary, dayOptions),
    [dayOptions, itinerary]
  );
  const tripDates =
    initialData?.dates ||
    [initialData?.startDate, initialData?.endDate].filter(Boolean).join(" to ") ||
    "Not specified";
  const summaryStats = [
    {
      label: "Days",
      value: dayOptions.length
    },
    {
      label: "Stops",
      value: totalStops
    },
    {
      label: "Route",
      value: routeData.distanceKm ? `${routeData.distanceKm} km` : "Building"
    },
    {
      label: "Per Day",
      value: `${placesPerDay} ${placesPerDay === 1 ? "stop" : "stops"}`
    }
  ];

  const weatherAlertDays = useMemo(
    () =>
      weather
        .map((day, index) => ({
          label: `Day ${index + 1}`,
          condition: day.condition || "Forecast updated",
          severity: getWeatherSeverityLabel(day)
        }))
        .filter((day) => day.severity === "bad"),
    [weather]
  );

  useEffect(() => {
    const fetchRoute = async () => {
      const response = await axios.post(`${API_BASE_URL}/api/travel/route`, {
        places: highlightedPlaces
      });
      setRouteData(response.data);
    };

    if (highlightedPlaces.filter((place) => place.latitude && place.longitude).length >= 2) {
      fetchRoute().catch(() => {
        setRouteData({ geometry: [], distanceKm: 0, durationMinutes: 0, legs: [] });
      });
    } else {
      setRouteData({ geometry: [], distanceKm: 0, durationMinutes: 0, legs: [] });
    }
  }, [highlightedPlaces]);

  useEffect(() => {
    const fetchBudgetEstimate = async () => {
      if (!city || dayOptions.length === 0 || itineraryDestinations.length === 0) {
        setBudgetState({ loading: false, error: "", estimate: null });
        return;
      }

      try {
        setBudgetState((current) => ({
          loading: true,
          error: "",
          estimate: current.estimate
        }));

        const response = await axios.post(`${API_BASE_URL}/api/travel/budget`, {
          city,
          days: dayOptions.length,
          dates: tripDates,
          totalPlaces: totalStops,
          placesPerDay,
          itinerarySummary,
          destinations: itineraryDestinations
        });

        setBudgetState({
          loading: false,
          error: "",
          estimate: response.data?.budgetEstimate || null
        });
      } catch (error) {
        setBudgetState({
          loading: false,
          error: error.response?.data?.message || "Unable to load budget estimate right now.",
          estimate: null
        });
      }
    };

    fetchBudgetEstimate();
  }, [city, dayOptions.length, itineraryDestinations, itinerarySummary, placesPerDay, totalStops, tripDates]);

  useEffect(() => {
    const fetchWeather = async () => {
      const response = await axios.get(`${API_BASE_URL}/api/travel/weather`, {
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          days: dayOptions.length
        }
      });
      setWeather(response.data.forecast || []);
    };

    if (
      coordinates?.latitude &&
      coordinates?.longitude &&
      (weather.length === 0 || weather.length !== dayOptions.length)
    ) {
      fetchWeather().catch(() => {
        setWeather([]);
      });
    }
  }, [coordinates, dayOptions.length, weather.length]);

  const handleSaveTrip = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaveState({ saving: true, message: "", shareUrl: "" });
      const response = await axios.post(
        `${API_BASE_URL}/api/trips`,
        {
          city,
          days: dayOptions.length,
          placesPerDay,
          itinerary,
          interests,
          coordinates,
          weather,
          route: routeData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const shareUrl = `${window.location.origin}${response.data.shareUrl}`;
      setSaveState({
        saving: false,
        message: "Trip saved successfully.",
        shareUrl
      });
    } catch (error) {
      setSaveState({
        saving: false,
        message: error.response?.data?.message || "Failed to save trip.",
        shareUrl: ""
      });
    }
  };

  const handleShareTrip = async () => {
    const shareUrl = saveState.shareUrl || (readOnly ? window.location.href : "");

    if (!shareUrl) {
      setActionMessage("Save the trip first, then share the generated link.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: city ? `${city} TripWise itinerary` : "TripWise itinerary",
          text: "Take a look at this TripWise itinerary.",
          url: shareUrl
        });
        setActionMessage("Share sheet opened.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setActionMessage("Share link copied.");
    } catch (error) {
      setActionMessage("Unable to share right now.");
    }
  };

  const handleExportPdf = () => {
    const printableMarkup = buildPrintableMarkup({
      city,
      itinerary,
      dayOptions,
      routeData,
      weather,
      placesPerDay
    });

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("title", "TripWise PDF export");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";

    const cleanup = () => {
      window.setTimeout(() => {
        printFrame.remove();
      }, 1200);
    };

    printFrame.onload = () => {
      const frameWindow = printFrame.contentWindow;

      if (!frameWindow) {
        setActionMessage("Unable to open PDF export right now.");
        cleanup();
        return;
      }

      frameWindow.focus();
      frameWindow.print();
      setActionMessage("Print dialog opened. Choose 'Save as PDF'.");
      cleanup();
    };

    document.body.appendChild(printFrame);
    const frameDocument = printFrame.contentWindow?.document;

    if (!frameDocument) {
      setActionMessage("Unable to open PDF export right now.");
      cleanup();
      return;
    }

    frameDocument.open();
    frameDocument.write(printableMarkup);
    frameDocument.close();
  };

  const handleWeatherSmartReplan = async () => {
    if (weather.length === 0) {
      setWeatherReplanSummary([]);
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: "Weather forecast is not ready yet."
      });
      return;
    }

    try {
      setPlannerState({ optimizing: false, autoPlanning: false, weatherReplanning: true, message: "" });
      const response = await axios.post(`${API_BASE_URL}/api/travel/weather-replan`, {
        itinerary,
        forecast: weather
      });

      setItinerary(response.data.itinerary || itinerary);
      setWeatherReplanSummary(response.data.changes || []);
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: response.data.message || "Weather smart replan applied."
      });
    } catch (error) {
      setWeatherReplanSummary([]);
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: error.response?.data?.message || "Failed to weather-smart replan trip."
      });
    }
  };

  const optimizeRoute = async () => {
    try {
      setPlannerState({ optimizing: true, autoPlanning: false, weatherReplanning: false, message: "" });
      const response = await axios.post(`${API_BASE_URL}/api/travel/optimize`, {
        places: highlightedPlaces
      });

      setItinerary((current) => rebuildItineraryFromTemplate(current, response.data.places || []));
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: "Route optimized to reduce travel distance."
      });
    } catch (error) {
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: error.response?.data?.message || "Failed to optimize route."
      });
    }
  };

  const autoPlanTrip = async () => {
    try {
      setPlannerState({ optimizing: false, autoPlanning: true, weatherReplanning: false, message: "" });

      const planningPool = Array.from(
        new Map(
          [...suggestedPlaces, ...highlightedPlaces].map((place, index) => [
            getPlaceDedupKey(place) || place.id || `${place.name}-${index}`,
            place
          ])
        ).values()
      );

      const response = await axios.post(`${API_BASE_URL}/api/travel/auto-plan`, {
        days: dayOptions.length,
        places: planningPool,
        placesPerDay
      });

      setItinerary(response.data.itinerary || {});
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: "Trip auto-planned across all days."
      });
    } catch (error) {
      setPlannerState({
        optimizing: false,
        autoPlanning: false,
        weatherReplanning: false,
        message: error.response?.data?.message || "Failed to auto plan trip."
      });
    }
  };

  if (Object.keys(itinerary).length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <span className="text-lg text-slate-500">No itinerary to display yet.</span>
      </div>
    );
  }

  return (
    <section className="planx-page overflow-x-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="planx-page-content mx-auto max-w-[1520px] pt-6">
        <div className="planx-dark-panel rounded-[36px] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffe2c6]">
                  Itinerary ready
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                  {dayOptions.length} days
                </span>
              </div>

              <h1 className="mt-6 font-[var(--font-editorial)] text-4xl font-semibold tracking-tight sm:text-5xl">
                {city ? `${city} travel plan` : "Your TripWise itinerary"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Built from live place suggestions and arranged into a clearer day-by-day route.
              </p>
            </div>

            {!readOnly && (
              <div className="space-y-3">
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleShareTrip}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleWeatherSmartReplan}
                    disabled={weather.length === 0 || plannerState.weatherReplanning}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {plannerState.weatherReplanning ? "Replanning..." : "Weather Smart Replan"}
                  </button>
                  <button
                    type="button"
                    onClick={optimizeRoute}
                    disabled={plannerState.optimizing || plannerState.weatherReplanning || plannerState.autoPlanning}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-70"
                  >
                    {plannerState.optimizing ? "Optimizing..." : "Optimize Route"}
                  </button>
                  <button
                    type="button"
                    onClick={autoPlanTrip}
                    disabled={plannerState.autoPlanning || plannerState.weatherReplanning || plannerState.optimizing}
                    className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950 disabled:opacity-70"
                  >
                    {plannerState.autoPlanning ? "Planning..." : "Auto Plan Trip"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrip}
                    disabled={saveState.saving}
                    className="rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950 disabled:opacity-70"
                  >
                    {saveState.saving ? "Saving..." : "Save Trip"}
                  </button>
                </div>
                {plannerState.message && (
                  <p className="text-sm text-slate-200">{plannerState.message}</p>
                )}
                {weatherAlertDays.length > 0 && (
                  <p className="text-sm text-slate-200">
                    Weather watch: {weatherAlertDays.map((day) => `${day.label} (${day.condition})`).join(", ")}
                  </p>
                )}
                {weatherReplanSummary.length > 0 && (
                  <div className="rounded-[22px] border border-white/15 bg-white/5 p-4 text-sm text-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8ddfff]">
                      Weather Replan Changes
                    </p>
                    <div className="mt-3 space-y-2">
                      {weatherReplanSummary.map((change) => (
                        <p key={change.dayKey}>
                          {change.label} was adjusted for {change.condition}.
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {saveState.message && (
                  <p className="text-sm text-slate-200">{saveState.message}</p>
                )}
                {saveState.shareUrl && (
                  <a
                    href={saveState.shareUrl}
                    className="block text-sm font-medium text-[#8ddfff] underline"
                  >
                    {saveState.shareUrl}
                  </a>
                )}
                {actionMessage && (
                  <p className="text-sm text-slate-200">{actionMessage}</p>
                )}
              </div>
            )}
            {readOnly && (
              <div className="space-y-3">
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleShareTrip}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Export PDF
                  </button>
                </div>
                {actionMessage && (
                  <p className="text-sm text-slate-200">{actionMessage}</p>
                )}
              </div>
            )}
          </div>

          {interests.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium capitalize text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,30,38,0.84)_0%,rgba(14,47,58,0.74)_100%)] p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                  AI Budget Estimate
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Budget with your itinerary
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  This estimate uses your destination, number of days, planned stops, and day-wise itinerary to generate Basic, Standard, and Premium budgets.
                </p>
              </div>

              {budgetState.estimate?.trip_summary && (
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {budgetState.estimate.trip_summary.pace} pace
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {budgetState.estimate.trip_summary.cost_level} cost
                  </span>
                </div>
              )}
            </div>

            {budgetState.loading && (
              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 text-sm text-slate-300">
                Generating budget estimate...
              </div>
            )}

            {budgetState.error && !budgetState.loading && (
              <div className="mt-4 rounded-[22px] border border-rose-400/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
                {budgetState.error}
              </div>
            )}

            {budgetState.estimate?.budget && !budgetState.loading && (
              <>
                <div className="mt-5 flex flex-wrap gap-3">
                  {budgetTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveBudgetTab(tab.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeBudgetTab === tab.id
                          ? "bg-[#0b3b43] text-white"
                          : "border border-white/10 bg-white/8 text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <BudgetTierCard
                    label={budgetTabs.find((tab) => tab.id === activeBudgetTab)?.label || "Standard"}
                    tier={budgetState.estimate.budget[activeBudgetTab] || budgetState.estimate.budget.standard}
                    tone={
                      activeBudgetTab === "basic"
                        ? {
                            border: "border-emerald-200",
                            background: "bg-emerald-50/80",
                            kicker: "text-emerald-700"
                          }
                        : activeBudgetTab === "premium"
                          ? {
                              border: "border-amber-200",
                              background: "bg-amber-50/80",
                              kicker: "text-amber-700"
                            }
                          : {
                              border: "border-sky-200",
                              background: "bg-sky-50/80",
                              kicker: "text-sky-700"
                            }
                    }
                  />
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                      Insights
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                      {budgetState.estimate.insights.map((item, index) => (
                        <p key={`budget-insight-${index}`}>• {item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-rose-400/25 bg-rose-500/10 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
                      Caution
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                      {budgetState.estimate.caution.map((item, index) => (
                        <p key={`budget-caution-${index}`}>• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:h-[calc(100vh-18rem)] xl:grid-cols-[minmax(0,1.08fr)_minmax(460px,540px)] xl:items-stretch">
          <div className="min-w-0 xl:h-full xl:overflow-y-auto xl:pr-3">
            <div className="space-y-6">
              <ItineraryEditor
                itinerary={itinerary}
                setItinerary={setItinerary}
                routeLegs={routeData.legs || []}
                loading={plannerState.optimizing || plannerState.autoPlanning || plannerState.weatherReplanning}
                readOnly={readOnly}
                onPlaceSelect={(place) => setSelectedPlaceId(place.id)}
                onOpenAddModal={(dayKey, slot, addPlace) =>
                  !readOnly &&
                  setModalState({
                    isOpen: true,
                    dayKey,
                    slot,
                    addPlace
                  })
                }
              />
            </div>
          </div>

          <aside className="min-w-0 xl:h-full xl:self-start">
            <div className="xl:sticky xl:top-6">
              <PlacesMap
                places={highlightedPlaces.length > 0 ? highlightedPlaces : places}
                routeGeometry={routeData.geometry}
                selectedPlaceId={selectedPlaceId}
                onMarkerSelect={(place) => setSelectedPlaceId(place.id)}
              />
              <div className="mt-6">
                <WeatherCards forecast={weather} city={city} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {!readOnly && (
        <AddPlaceModal
          isOpen={modalState.isOpen}
          dayOptions={dayOptions}
          defaultDayKey={modalState.dayKey}
          defaultSlot={modalState.slot}
          suggestedPlaces={suggestedPlaces}
          onClose={() =>
            setModalState((current) => ({
              ...current,
              isOpen: false
            }))
          }
          onAdd={(dayKey, slot, place) => {
            modalState.addPlace(dayKey, slot, place);
          }}
        />
      )}
    </section>
  );
};

export default TripWorkspace;

