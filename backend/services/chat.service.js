import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const costData = {
  Goa: { avgCostPerDay: 1500 },
  Jaipur: { avgCostPerDay: 1200 },
  Manali: { avgCostPerDay: 1800 }
};

const getGeminiApiKey = () => sanitizeApiKey(process.env.GEMINI_API_KEY || "");

const getGeminiModel = () => (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();

const extractDays = (message) => {
  const daysMatch = message.match(/\b(\d+)\s*(?:day|days)\b/i);
  if (!daysMatch) {
    return null;
  }

  const parsed = Number(daysMatch[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const extractBudget = (message) => {
  const budgetMatch = message.match(
    /\b(?:under|within|budget(?:\s*of)?|in)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\b/i
  );

  if (!budgetMatch) {
    return null;
  }

  const numeric = Number(budgetMatch[1].replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const extractDestination = (message) => {
  const loweredMessage = message.toLowerCase();
  const found = Object.keys(costData).find((city) => loweredMessage.includes(city.toLowerCase()));
  return found || null;
};

const hasPlanningKeywords = (message) =>
  /\b(plan|trip|itinerary|budget|suggest|travel|cost|estimate)\b/i.test(message);

const detectPlanningIntent = (message = "") => {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      isPlanningIntent: false,
      destination: null,
      days: null,
      budget: null
    };
  }

  const destination = extractDestination(trimmed);
  const days = extractDays(trimmed);
  const budget = extractBudget(trimmed);

  return {
    isPlanningIntent: hasPlanningKeywords(trimmed) && Boolean(destination || days || budget),
    destination,
    days,
    budget
  };
};

const createPlanningPrompt = ({ message, destination, days, budget }) => {
  const destinationText = destination || "the requested destination";
  const durationText = days ? `${days} day(s)` : "the requested duration";
  const budgetText = budget ? `INR ${budget}` : "the user's budget preference";

  return [
    "You are PlanX Assistant, a practical and friendly India travel planner.",
    `User message: "${message}"`,
    `Destination: ${destinationText}`,
    `Duration: ${durationText}`,
    `Budget target: ${budgetText}`,
    "Write a concise helpful reply in plain text. If the user is asking for a trip, give a simple itinerary and practical advice."
  ].join("\n");
};

const createGeneralPrompt = (message) =>
  [
    "You are PlanX Assistant for a travel planning app.",
    "Give concise, practical, conversational travel guidance.",
    `User message: "${message}"`
  ].join("\n");

const getFallbackReply = (message, isPlanningIntent) => {
  if (isPlanningIntent) {
    return "I can help plan that trip. Share your destination, number of days, and any budget preference, and I will suggest a simple itinerary.";
  }

  return `I can help with that travel question: "${message}".`;
};

const fetchGeminiResponse = async (text) => {
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
              text
            }
          ]
        }
      ]
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

export const processChatMessage = async (message) => {
  const intent = detectPlanningIntent(message);
  const prompt = intent.isPlanningIntent
    ? createPlanningPrompt({ message, ...intent })
    : createGeneralPrompt(message);

  const reply = (await fetchGeminiResponse(prompt)) || getFallbackReply(message, intent.isPlanningIntent);

  return { reply };
};

export { costData, detectPlanningIntent };
