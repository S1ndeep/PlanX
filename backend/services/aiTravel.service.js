import axios from "axios";
import { getCityCoordinates, getNearbyAttractions } from "./opentripmap.service.js";
import { getFoodAndLeisurePlaces } from "./geoapify.service.js";
import { getDailyForecast } from "./weather.service.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const sanitizeApiKey = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

const getOpenAiApiKey = () => sanitizeApiKey(process.env.OPENAI_API_KEY || "");

export const buildItineraryPrompt = ({ destination, budget, duration, interests, weather, attractions }) => {
  return [
    "You are TripWise, an expert travel-planning AI.",
    "Return only valid JSON with this shape:",
    '{"destination":"","budget":0,"duration":0,"days":[{"day":1,"theme":"","estimatedCost":0,"weatherNote":"","schedule":[{"time":"","title":"","type":"","cost":0,"notes":""}]}],"savingTips":[]}',
    `Destination: ${destination}`,
    `Budget INR: ${budget}`,
    `Duration days: ${duration}`,
    `Interests: ${(interests || []).join(", ") || "balanced"}`,
    `Weather: ${JSON.stringify(weather || [])}`,
    `Candidate attractions: ${JSON.stringify((attractions || []).slice(0, 20))}`,
    "Optimize for cost, realistic travel time, local food, and one flexible buffer per day."
  ].join("\n");
};

const buildFallbackItinerary = ({ destination, budget, duration, interests, weather, attractions }) => {
  const parsedDuration = Math.max(1, Number(duration) || 1);
  const parsedBudget = Math.max(0, Number(budget) || 0);
  const perDay = parsedBudget > 0 ? Math.floor(parsedBudget / parsedDuration) : 2500;
  const candidatePlaces = attractions.length > 0 ? attractions : [{ name: `${destination} heritage walk`, type: "culture" }];

  return {
    destination,
    budget: parsedBudget,
    duration: parsedDuration,
    days: Array.from({ length: parsedDuration }, (_, index) => {
      const first = candidatePlaces[index % candidatePlaces.length];
      const second = candidatePlaces[(index + 1) % candidatePlaces.length];
      const interest = interests[index % Math.max(interests.length, 1)] || "culture";

      return {
        day: index + 1,
        theme: `${interest} and local discovery`,
        estimatedCost: perDay,
        weatherNote: weather[index]?.condition
          ? `${weather[index].condition}, ${weather[index].temperatureMin}-${weather[index].temperatureMax} C`
          : "Check local forecast before departure.",
        schedule: [
          {
            time: "09:00",
            title: first.name || `Explore ${destination}`,
            type: first.interest || first.type || interest,
            cost: Math.round(perDay * 0.25),
            notes: "Start early to avoid crowds and heat."
          },
          {
            time: "13:00",
            title: "Local lunch",
            type: "food",
            cost: Math.round(perDay * 0.18),
            notes: "Pick a restaurant near the morning stop to reduce transit."
          },
          {
            time: "16:00",
            title: second.name || `${destination} viewpoint`,
            type: second.interest || second.type || "attraction",
            cost: Math.round(perDay * 0.22),
            notes: "Keep this slot flexible for traffic or weather."
          }
        ]
      };
    }),
    savingTips: [
      "Use public transport or shared cabs for short hops.",
      "Book major attractions ahead when online discounts are available.",
      "Keep one low-cost local food plan per day."
    ],
    provider: "fallback"
  };
};

const fetchPlanningContext = async ({ destination, duration }) => {
  try {
    const coordinates = await getCityCoordinates(destination);
    const [attractions, foodAndLeisure, weather] = await Promise.allSettled([
      getNearbyAttractions({ ...coordinates, limit: 12 }),
      getFoodAndLeisurePlaces({ ...coordinates, limit: 12 }),
      getDailyForecast({ ...coordinates, days: duration })
    ]);

    return {
      coordinates,
      attractions: [
        ...(attractions.status === "fulfilled" ? attractions.value : []),
        ...(foodAndLeisure.status === "fulfilled" ? foodAndLeisure.value : [])
      ],
      weather: weather.status === "fulfilled" ? weather.value : []
    };
  } catch (error) {
    return {
      coordinates: null,
      attractions: [],
      weather: []
    };
  }
};

export const generatePersonalizedItinerary = async ({ destination, budget, duration, interests = [] }) => {
  const context = await fetchPlanningContext({ destination, duration });
  const prompt = buildItineraryPrompt({
    destination,
    budget,
    duration,
    interests,
    weather: context.weather,
    attractions: context.attractions
  });
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return {
      itinerary: buildFallbackItinerary({
        destination,
        budget,
        duration,
        interests,
        weather: context.weather,
        attractions: context.attractions
      }),
      prompt,
      context
    };
  }

  const response = await axios.post(
    OPENAI_URL,
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You produce precise JSON travel plans. No markdown." },
        { role: "user", content: prompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );

  const raw = response.data.choices?.[0]?.message?.content || "{}";
  const itinerary = JSON.parse(raw);

  return {
    itinerary: {
      ...itinerary,
      provider: "openai"
    },
    prompt,
    context
  };
};

export const recommendFromHistory = ({ trips = [], limit = 5 }) => {
  const interestCounts = new Map();
  const destinationCounts = new Map();

  trips.forEach((trip) => {
    (trip.interests || []).forEach((interest) => {
      interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1);
    });
    (trip.destinations || [trip.city]).filter(Boolean).forEach((destination) => {
      destinationCounts.set(destination, (destinationCounts.get(destination) || 0) + 1);
    });
  });

  return {
    interests: [...interestCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([interest]) => interest),
    destinations: [...destinationCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([destination]) => destination)
  };
};
