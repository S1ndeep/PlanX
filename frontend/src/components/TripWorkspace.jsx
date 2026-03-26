import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = () => resolve();
          image.onerror = () => resolve();
        })
    )
  );
};

const downloadElementAsPdf = async (element) => {
  if (!element) {
    throw new Error("Missing PDF content");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: Math.max(2, window.devicePixelRatio || 1),
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const pixelsPerMm = canvas.width / contentWidth;
  const pageHeightPx = Math.floor(contentHeight * pixelsPerMm);

  let renderedHeightPx = 0;
  let pageNumber = 0;

  while (renderedHeightPx < canvas.height) {
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

    const sliceContext = sliceCanvas.getContext("2d");

    if (!sliceContext) {
      throw new Error("Unable to create PDF page canvas");
    }

    sliceContext.drawImage(
      canvas,
      0,
      renderedHeightPx,
      canvas.width,
      sliceCanvas.height,
      0,
      0,
      canvas.width,
      sliceCanvas.height
    );

    if (pageNumber > 0) {
      pdf.addPage();
    }

    const pageImageHeight = sliceCanvas.height / pixelsPerMm;
    pdf.addImage(
      sliceCanvas.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      contentWidth,
      pageImageHeight,
      undefined,
      "FAST"
    );

    renderedHeightPx += sliceCanvas.height;
    pageNumber += 1;
  }

  pdf.save("itinerary.pdf");
};

const TripWorkspace = ({ initialData, readOnly = false, showReadOnlyActions = true }) => {
  const navigate = useNavigate();
  const pdfContentRef = useRef(null);
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
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [weatherReplanSummary, setWeatherReplanSummary] = useState([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const city = initialData?.city || "";
  const places = initialData?.places || [];
  const interests = initialData?.interests || [];
  const coordinates = initialData?.coordinates || null;
  const placesPerDay = initialData?.placesPerDay || inferPlacesPerDay(itinerary);

  const highlightedPlaces = useMemo(
    () => flattenItineraryPlaces(itinerary),
    [itinerary]
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

  const handleExportPdf = async () => {
    if (isExportingPdf) {
      return;
    }

    try {
      setIsExportingPdf(true);
      setActionMessage("");
      await downloadElementAsPdf(pdfContentRef.current);
      setActionMessage("Downloaded itinerary.pdf");
    } catch (error) {
      setActionMessage("Unable to download PDF right now.");
    } finally {
      setIsExportingPdf(false);
    }
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
    <section className="relative overflow-x-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] opacity-0">
        <div ref={pdfContentRef} className="w-[794px] bg-white px-10 py-10 text-slate-900">
          <section className="rounded-[28px] bg-[#0b3b43] px-8 py-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8ebff]">
              TripWise itinerary
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              {city ? `${city} travel plan` : "Your itinerary"}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-200">
              A clean export of your day-by-day route, stops, and travel planning summary.
            </p>
          </section>

          <section className="mt-6 grid grid-cols-4 gap-4">
            {summaryStats.map((stat) => (
              <div
                key={`pdf-${stat.label}`}
                className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 space-y-6">
            {dayOptions.map(({ value: dayKey, label }) => {
              const day = itinerary[dayKey] || {};
              const dayStopCount = slotOrder.reduce(
                (count, slot) => count + ((day[slot] || []).length),
                0
              );

              return (
                <article
                  key={`pdf-${dayKey}`}
                  className="rounded-[24px] border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                        {label}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        {dayStopCount} {dayStopCount === 1 ? "stop" : "stops"}
                      </h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Morning to Afternoon to Evening</p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-4">
                    {slotOrder.map((slot) => {
                      const placesForSlot = day[slot] || [];

                      return (
                        <section
                          key={`pdf-${dayKey}-${slot}`}
                          className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-[#eaf6fb] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#147ea2]">
                              {slotLabels[slot]}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {placesForSlot.length} {placesForSlot.length === 1 ? "stop" : "stops"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            {placesForSlot.length > 0 ? (
                              placesForSlot.map((place, index) => (
                                <div
                                  key={`pdf-${dayKey}-${slot}-${place.id || place.name}-${index}`}
                                  className="rounded-[18px] border border-slate-200 bg-white px-4 py-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-base font-semibold leading-6 text-slate-900">
                                      {place.name || `Stop ${index + 1}`}
                                    </h3>
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                      {place.category || place.interest || "Stop"}
                                    </span>
                                  </div>
                                  {place.description && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {place.description}
                                    </p>
                                  )}
                                  {place.address && (
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                      {place.address}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                                No stops planned.
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>

          {weather.length > 0 && (
            <section className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                Weather
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {weather.map((entry, index) => (
                  <div
                    key={`pdf-weather-${entry.day || entry.date || index}`}
                    className="rounded-[18px] border border-slate-200 bg-white px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {entry.day || entry.date || `Day ${index + 1}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {entry.summary || entry.condition || "Forecast available"}
                    </p>
                    {(entry.temperatureC || entry.temp) && (
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {entry.temperatureC ?? entry.temp}
                        {entry.temperatureC ? " degrees C" : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
        alt="Turquoise ocean meeting a bright tropical shoreline"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,22,31,0.64)_0%,rgba(6,30,38,0.68)_24%,rgba(243,239,232,0.9)_54%,rgba(239,236,230,0.95)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(30,199,243,0.12),transparent_18%)]" />

      <div className="relative mx-auto max-w-[1520px]">
        <div className="rounded-[36px] border border-white/12 bg-[rgba(3,9,28,0.68)] px-6 py-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.18)] backdrop-blur-[24px] sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8ddfff]">
                  Itinerary ready
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                  {dayOptions.length} days
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
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
                    disabled={isExportingPdf}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {isExportingPdf ? "Downloading PDF..." : "Export PDF"}
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
            {readOnly && showReadOnlyActions && (
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
                    disabled={isExportingPdf}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {isExportingPdf ? "Downloading PDF..." : "Export PDF"}
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

