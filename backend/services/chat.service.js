import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const costData = {
  Goa: { avgCostPerDay: 1500 },
  Jaipur: { avgCostPerDay: 1200 },
  Manali: { avgCostPerDay: 1800 }
};

const getGeminiApiKey = () => sanitizeApiKey(process.env.GEMINI_API_KEY || "");

const getGeminiModel = () => (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();

const normalizeDestination = (value = "") => {
  const lowered = value.trim().toLowerCase();
  const match = Object.keys(costData).find((city) => city.toLowerCase() === lowered);
  return match || null;
};

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
  const cities = Object.keys(costData);
  const loweredMessage = message.toLowerCase();
  const found = cities.find((city) => loweredMessage.includes(city.toLowerCase()));
  return found || null;
};

const hasPlanningKeywords = (message) =>
  /\b(plan|trip|itinerary|budget|suggest|travel)\b/i.test(message);

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
  const isPlanningIntent = hasPlanningKeywords(trimmed) && Boolean(destination || days || budget);

  return {
    isPlanningIntent,
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
    "Write a concise itinerary in plain text with day-wise suggestions, food tips, and one money-saving tip."
  ].join("\n");
};

const createGeneralPrompt = (message) =>
  [
    "You are PlanX Assistant for a travel planning app.",
    "Give concise, practical travel guidance.",
    `User message: "${message}"`
  ].join("\n");

const getFallbackReply = (message, isPlanningIntent) => {
  if (isPlanningIntent) {
    return "I can help with that trip. Here's a simple itinerary and budget estimate based on your request.";
  }

  return `I can help with that travel question: "${message}".`;
};

const getAiReply = async ({ message, isPlanningIntent, destination, days, budget }) => {
  const apiKey = getGeminiApiKey();
  const prompt = isPlanningIntent
    ? createPlanningPrompt({ message, destination, days, budget })
    : createGeneralPrompt(message);

  if (!apiKey) {
    return getFallbackReply(message, isPlanningIntent);
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
      ]
    },
    {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  const aiText = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return aiText || getFallbackReply(message, isPlanningIntent);
};

const calculateBudgetBreakdown = ({ destination, days }) => {
  const normalizedDestination = normalizeDestination(destination || "");
  if (!normalizedDestination || !days) {
    return null;
  }

  const stay = costData[normalizedDestination].avgCostPerDay * days;
  const food = 500 * days;
  const travel = 1000;
  const estimatedCost = stay + food + travel;

  return {
    estimatedCost,
    breakdown: {
      stay,
      food,
      travel
    }
  };
};

export const processChatMessage = async (message) => {
  const intent = detectPlanningIntent(message);
  const effectiveDays = intent.days || 3;

  const reply = await getAiReply({
    message,
    isPlanningIntent: intent.isPlanningIntent,
    destination: intent.destination,
    days: effectiveDays,
    budget: intent.budget
  });

  if (!intent.isPlanningIntent) {
    return { reply };
  }

  const budgetDetails = calculateBudgetBreakdown({
    destination: intent.destination,
    days: effectiveDays
  });

  if (!budgetDetails) {
    return { reply };
  }

  return {
    reply,
    estimatedCost: budgetDetails.estimatedCost,
    breakdown: budgetDetails.breakdown
  };
};

export { costData, detectPlanningIntent };
