import axios from "axios";
import { getTopCityAttractions, hasTravelAdvisorKey } from "../services/travelAdvisor.service.js";

export const getDestinationDetails = async (req, res) => {
  try {
    const { cityName } = req.params;

    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    console.log(`Fetching destination details for: ${cityName}`);

    const result = {
      name: cityName,
      description: "",
      image: null,
      attractions: [],
      weather: null,
      videos: []
    };

    try {
      const wikiResponse = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`,
        {
          timeout: 5000,
          headers: {
            "User-Agent": "TripWiseApp/1.0 (support@tripwise.com)"
          }
        }
      );

      result.description = wikiResponse.data.extract || "No description available.";
      result.image = wikiResponse.data.thumbnail?.source || wikiResponse.data.originalimage?.source || null;
    } catch (wikiError) {
      console.error("Wikipedia API error:", wikiError.response?.status || wikiError.message);
      result.description = `Discover the beauty and culture of ${cityName}.`;
    }

    if (hasTravelAdvisorKey()) {
      try {
        result.attractions = await getTopCityAttractions(cityName, 6);
        console.log(`TravelAdvisor attractions fetched for ${cityName}: ${result.attractions.length}`);
      } catch (travelAdvisorError) {
        console.error("TravelAdvisor API error:", travelAdvisorError.response?.status || travelAdvisorError.message);
        console.error("TravelAdvisor error details:", travelAdvisorError.response?.data);
      }
    } else {
      console.warn("TravelAdvisor API key not found in environment variables");
    }

    const openWeatherKey = process.env.OPENWEATHER_API_KEY;

    if (openWeatherKey) {
      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${openWeatherKey}&units=metric`,
          { timeout: 5000 }
        );

        if (weatherResponse.data) {
          result.weather = {
            temperature: Math.round(weatherResponse.data.main?.temp || 0),
            condition: weatherResponse.data.weather?.[0]?.description || "N/A",
            humidity: weatherResponse.data.main?.humidity || 0,
            icon: weatherResponse.data.weather?.[0]?.icon || "01d"
          };
        }
      } catch (weatherError) {
        console.error("OpenWeather API error:", weatherError.response?.status || weatherError.message);
        console.error("Weather error details:", weatherError.response?.data);
      }
    } else {
      console.warn("OpenWeather API key not found in environment variables");
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    if (youtubeApiKey) {
      try {
        const youtubeResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: `${cityName} travel guide`,
            type: "video",
            maxResults: 6,
            key: youtubeApiKey
          },
          timeout: 5000
        });

        if (youtubeResponse.data?.items) {
          result.videos = youtubeResponse.data.items.map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
          }));
        }
      } catch (youtubeError) {
        console.error("YouTube API error:", youtubeError.response?.status || youtubeError.message);
        console.error("YouTube error details:", youtubeError.response?.data?.error);
      }
    } else {
      console.warn("YouTube API key not found in environment variables");
    }

    return res.json(result);
  } catch (error) {
    console.error("Destination controller error:", error);
    return res.status(500).json({
      error: "Failed to fetch destination details",
      message: error.message
    });
  }
};
