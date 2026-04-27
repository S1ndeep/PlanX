import { useEffect, useRef, useState } from "react";
import axios from "axios";
import CityCard from "../components/CityCard.jsx";
import { API_BASE_URL } from "../utils/auth.js";

const ExploreCities = () => {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelTokenRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New search initiated");
    }

    const searchTerm = query.trim();

    // Don't search if less than 2 characters
    if (searchTerm.length < 2) {
      setCities([]);
      setError("");
      setLoading(false);
      return;
    }

    // Debounce: wait 500ms before searching
    debounceTimerRef.current = setTimeout(() => {
      searchCities(searchTerm);
    }, 500);
  }, [query]);

  const searchCities = async (searchTerm) => {
    setLoading(true);
    setError("");

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      const response = await axios.get(`${API_BASE_URL}/api/external/cities`, {
        params: { q: searchTerm },
        cancelToken: cancelTokenRef.current.token
      });

      setCities(response.data.cities || []);
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) {
        // Request was cancelled, ignore
        return;
      }

      setError("Failed to fetch cities. Please try again.");
      setCities([]);
      setLoading(false);
      console.error("Search error:", err);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Explore Cities in India</h1>
        <p style={{ fontSize: "17px", marginBottom: "20px", color: "#6d6d6d" }}>
          Search for Indian cities using live data from GeoDB Cities API
        </p>

        <input
          className="search-bar"
          placeholder="Type at least 2 characters (e.g., 'Mumbai', 'Del', 'Ban')"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p style={{ fontSize: "18px", marginTop: "12px" }}>Searching cities...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p style={{ fontSize: "18px", color: "#d32f2f" }}>{error}</p>
          </div>
        )}

        {!loading && !error && query.trim().length >= 2 && cities.length === 0 && (
          <div className="no-results">
            <p style={{ fontSize: "18px", color: "#6d6d6d" }}>
              No cities found for "{query}". Try a different search term.
            </p>
          </div>
        )}

        {!loading && cities.length > 0 && (
          <div className="city-results-fade">
            <p style={{ fontSize: "16px", marginBottom: "16px", color: "#6d6d6d" }}>
              Found {cities.length} {cities.length === 1 ? "city" : "cities"}
            </p>
            <div className="card-grid">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreCities;
