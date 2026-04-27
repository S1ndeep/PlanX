import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const destinationCostLevels = {
  Goa: "moderate",
  Jaipur: "budget",
  Manali: "moderate",
  Hyderabad: "moderate",
  Udaipur: "moderate",
  Jodhpur: "moderate",
  Pushkar: "budget"
};

const getGeminiApiKey = () => sanitizeApiKey(process.env.GEMINI_API_KEY || "");

const getGeminiModel = () => (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();

const toInrRange = (min, max) =>
  `₹${Math.round(min).toLocaleString("en-IN")} - ₹${Math.round(max).toLocaleString("en-IN")}`;

const divideRange = (rangeText, divisor) => {
  const matches = String(rangeText)
    .replace(/₹/g, "")
    .split("-")
    .map((value) => Number(value.replace(/,/g, "").trim()))
    .filter(Number.isFinite);

  if (matches.length !== 2 || !divisor) {
    return rangeText;
  }

  return toInrRange(matches[0] / divisor, matches[1] / divisor);
};

const estimatePace = ({ days, totalPlaces, placesPerDay }) => {
  const effectivePlacesPerDay =
    Number(placesPerDay) || (Number(days) ? Math.ceil(Number(totalPlaces || 0) / Number(days)) : 0);

  if (effectivePlacesPerDay >= 4) {
    return "packed";
  }

  if (effectivePlacesPerDay >= 2) {
    return "moderate";
  }

  return "relaxed";
};

const estimateCostLevel = (city = "") => {
  const match = Object.keys(destinationCostLevels).find(
    (destination) => destination.toLowerCase() === String(city).trim().toLowerCase()
  );

  return match ? destinationCostLevels[match] : "moderate";
};

const fetchGeminiJson = async (prompt) => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  const response = await axios.post(
    `${GEMINI_API_URL}/${getGeminiModel()}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    },
    {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || null
  );
};

const extractJson = (value = "") => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
};

const normalizeTier = (tier = {}) => ({
  total: tier.total || "₹0 - ₹0",
  per_day: tier.per_day || "₹0 - ₹0",
  stay: tier.stay || "₹0 - ₹0",
  food: tier.food || "₹0 - ₹0",
  transport: tier.transport || "₹0 - ₹0",
  activities: tier.activities || "₹0 - ₹0",
  misc: tier.misc || "₹0 - ₹0"
});

const normalizeBudgetEstimate = (value) => {
  if (!value?.trip_summary || !value?.budget) {
    return null;
  }

  return {
    trip_summary: {
      pace: value.trip_summary.pace || "moderate",
      cost_level: value.trip_summary.cost_level || "moderate"
    },
    budget: {
      basic: normalizeTier(value.budget.basic),
      standard: normalizeTier(value.budget.standard),
      premium: normalizeTier(value.budget.premium)
    },
    insights: Array.isArray(value.insights) && value.insights.length > 0
      ? value.insights.slice(0, 3)
      : [],
    caution: Array.isArray(value.caution) && value.caution.length > 0
      ? value.caution.slice(0, 3)
      : []
  };
};

const buildBudgetPrompt = ({
  city,
  days,
  dates,
  totalPlaces,
  placesPerDay,
  itinerarySummary
}) =>
  [
    "You are an AI travel budget estimator.",
    "Your task is to calculate a realistic travel budget based on a given itinerary summary.",
    "",
    "INPUT:",
    `- Destination: ${city}`,
    `- Number of days: ${days}`,
    `- Travel dates: ${dates}`,
    `- Total places: ${totalPlaces}`,
    `- Places per day: ${placesPerDay}`,
    "- Sample itinerary summary:",
    itinerarySummary,
    "",
    "STEP 1: UNDERSTAND TRIP",
    "- Analyze the itinerary summary to estimate trip intensity (relaxed / moderate / packed)",
    "- Determine destination cost level (budget / moderate / expensive)",
    "- Assume the traveler is within India and using INR",
    "",
    "STEP 2: GENERATE 3 BUDGET TIERS",
    "Create 3 categories:",
    "1. Basic (budget-friendly travel)",
    "2. Standard (comfortable travel)",
    "3. Premium (luxury travel)",
    "",
    "STEP 3: CALCULATE COSTS",
    "For EACH category, estimate:",
    "- Stay (average per night × number of days)",
    "- Food (average per day × number of days)",
    "- Transport (local travel + transfers between places)",
    "- Activities / entry tickets",
    "- Miscellaneous expenses",
    "",
    "STEP 4: OUTPUT FORMAT (STRICT JSON)",
    "Return only valid JSON matching the required shape.",
    "",
    "RULES:",
    "- Use INR (₹) for all values",
    "- Provide realistic ranges (e.g. ₹8000 - ₹12000)",
    "- Ensure all fields are filled",
    "- Keep output strictly in JSON (no extra text, no markdown)",
    "- Base estimates on Indian travel conditions",
    "- insights must contain exactly 3 strings",
    "- caution must contain exactly 3 strings"
  ].join("\n");

const buildFallbackBudgetEstimate = ({
  city,
  days,
  dates,
  totalPlaces,
  placesPerDay
}) => {
  const safeDays = Math.max(1, Number(days) || 1);
  const pace = estimatePace({ days: safeDays, totalPlaces, placesPerDay });
  const costLevel = estimateCostLevel(city);

  const baseNight = costLevel === "budget" ? 900 : costLevel === "expensive" ? 2800 : 1500;
  const basicStay = toInrRange(baseNight * safeDays, (baseNight + 400) * safeDays);
  const standardStay = toInrRange((baseNight + 900) * safeDays, (baseNight + 1600) * safeDays);
  const premiumStay = toInrRange((baseNight + 2800) * safeDays, (baseNight + 5200) * safeDays);

  const basicFood = toInrRange(450 * safeDays, 750 * safeDays);
  const standardFood = toInrRange(900 * safeDays, 1500 * safeDays);
  const premiumFood = toInrRange(1800 * safeDays, 3200 * safeDays);

  const basicTransport = toInrRange(500 * safeDays, 1100 * safeDays);
  const standardTransport = toInrRange(1000 * safeDays, 2200 * safeDays);
  const premiumTransport = toInrRange(2500 * safeDays, 5000 * safeDays);

  const activityMultiplier = Math.max(1, Number(totalPlaces) || safeDays * 2);
  const basicActivities = toInrRange(150 * activityMultiplier, 350 * activityMultiplier);
  const standardActivities = toInrRange(350 * activityMultiplier, 700 * activityMultiplier);
  const premiumActivities = toInrRange(800 * activityMultiplier, 1800 * activityMultiplier);

  const basicMisc = toInrRange(300 * safeDays, 700 * safeDays);
  const standardMisc = toInrRange(700 * safeDays, 1500 * safeDays);
  const premiumMisc = toInrRange(1800 * safeDays, 3500 * safeDays);

  const totals = {
    basic: toInrRange(2300 * safeDays, 4300 * safeDays),
    standard: toInrRange(4500 * safeDays, 8000 * safeDays),
    premium: toInrRange(9500 * safeDays, 17000 * safeDays)
  };

  return {
    trip_summary: {
      pace,
      cost_level: costLevel
    },
    budget: {
      basic: {
        total: totals.basic,
        per_day: divideRange(totals.basic, safeDays),
        stay: basicStay,
        food: basicFood,
        transport: basicTransport,
        activities: basicActivities,
        misc: basicMisc
      },
      standard: {
        total: totals.standard,
        per_day: divideRange(totals.standard, safeDays),
        stay: standardStay,
        food: standardFood,
        transport: standardTransport,
        activities: standardActivities,
        misc: standardMisc
      },
      premium: {
        total: totals.premium,
        per_day: divideRange(totals.premium, safeDays),
        stay: premiumStay,
        food: premiumFood,
        transport: premiumTransport,
        activities: premiumActivities,
        misc: premiumMisc
      }
    },
    insights: [
      `Book stay in ${city || "the destination"} at least 2-3 weeks early for better mid-range prices.`,
      "Group nearby attractions on the same day to reduce repeated cab and auto costs.",
      dates
        ? `Compare weekday and weekend prices for ${dates}; hotel rates can change noticeably.`
        : "Travel on weekdays when possible to get lower hotel and transport rates."
    ],
    caution: [
      "Entry tickets, camera fees, and parking charges can add up faster than expected.",
      "App cab surge pricing and inter-area travel time can push local transport costs above the base estimate.",
      "Food and premium stay rates may rise sharply during holidays, festivals, and long weekends."
    ]
  };
};

export const getBudgetEstimate = async (tripContext = {}) => {
  const normalizedContext = {
    city: tripContext.city || "Not specified",
    days: Math.max(1, Number(tripContext.days) || 1),
    dates: tripContext.dates || "Not specified",
    totalPlaces:
      Number(tripContext.totalPlaces) ||
      (Array.isArray(tripContext.destinations) ? tripContext.destinations.length : 0),
    placesPerDay: Number(tripContext.placesPerDay) || "Not specified",
    itinerarySummary: String(tripContext.itinerarySummary || "Itinerary summary not provided.").trim()
  };

  const prompt = buildBudgetPrompt(normalizedContext);
  const rawJson = await fetchGeminiJson(prompt);
  const parsed = normalizeBudgetEstimate(extractJson(rawJson || ""));

  if (parsed?.trip_summary && parsed?.budget) {
    return parsed;
  }

  return buildFallbackBudgetEstimate(normalizedContext);
};
