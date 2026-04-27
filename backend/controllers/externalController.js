import axios from "axios";

// Search cities using TravelAdvisor API
export const searchCities = async (req, res) => {
  try {
    const { q } = req.query;

    // If search term is empty, return empty array
    if (!q || q.trim().length === 0) {
      return res.json({ cities: [] });
    }

    // Validate environment variable
    if (!process.env.TRAVELADVISOR_API_KEY) {
      console.error("TRAVELADVISOR_API_KEY is not defined in environment variables");
      return res.status(500).json({ message: "API configuration error" });
    }

    console.log(`🔍 Searching TravelAdvisor for: ${q.trim()}`);

    // Call TravelAdvisor Location Search API
    const response = await axios.get(
      "https://travel-advisor.p.rapidapi.com/locations/search",
      {
        params: {
          query: q.trim(),
          limit: 10,
          offset: 0,
          units: "km",
          location_id: "1",
          currency: "USD",
          sort: "relevance",
          lang: "en_US"
        },
        headers: {
          "X-RapidAPI-Key": process.env.TRAVELADVISOR_API_KEY,
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com"
        },
        timeout: 5000
      }
    );

    // Format the response
    const cities = response.data.data
      ?.filter(item => item.result_type === "geos" || item.result_type === "destinations")
      .map((location) => ({
        id: location.result_object?.location_id || Math.random().toString(36).substr(2, 9),
        name: location.result_object?.name || "Unknown",
        region: location.result_object?.address_obj?.state || location.result_object?.address_obj?.country || "",
        country: location.result_object?.address_obj?.country || "India",
        latitude: parseFloat(location.result_object?.latitude) || 0,
        longitude: parseFloat(location.result_object?.longitude) || 0,
        locationId: location.result_object?.location_id
      })) || [];

    console.log(`✅ TravelAdvisor: Found ${cities.length} locations`);
    return res.json({ cities });

  } catch (error) {
    console.error("❌ TravelAdvisor API Error:", error.response?.status || error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ message: "Search request timed out" });
    }

    if (error.response) {
      return res.status(error.response.status).json({ 
        message: "Failed to fetch locations from TravelAdvisor",
        details: error.response.data
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
