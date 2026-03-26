import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TripWorkspace from "../components/TripWorkspace.jsx";

const API_BASE_URL = "http://localhost:5000";

const SharedTripPage = () => {
  const { id } = useParams();
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/trips/${id}`);
        setTripData(response.data.trip);
      } catch (loadError) {
        setError("Unable to load shared trip.");
      }
    };

    loadTrip();
  }, [id]);

  if (error) {
    return <div className="px-6 py-16 text-center text-slate-500">{error}</div>;
  }

  if (!tripData) {
    return <div className="px-6 py-16 text-center text-slate-500">Loading trip...</div>;
  }

  return <TripWorkspace initialData={tripData} readOnly />;
};

export default SharedTripPage;
