import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TripCard from "../components/TripCard.jsx";
import { isDraftTrip } from "../components/tripUtils.js";
import {
  loadLocalDraftTrips,
  removeLocalDraftTrip
} from "../components/localDraftTrips.js";

const API_BASE_URL = "http://localhost:5000";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [deletingTripId, setDeletingTripId] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverTrips = response.data.trips || [];
        const localDraftTrips = loadLocalDraftTrips();
        setTrips([...localDraftTrips, ...serverTrips]);
      } catch {
        setError("Unable to load trips.");
      }
    };

    loadTrips();
  }, [token, navigate]);

  const upcomingTrips = useMemo(
    () => trips.filter((trip) => !isDraftTrip(trip)),
    [trips]
  );

  const draftTrips = useMemo(
    () => trips.filter((trip) => isDraftTrip(trip)),
    [trips]
  );

  const orderedTrips = useMemo(
    () => [...upcomingTrips, ...draftTrips],
    [draftTrips, upcomingTrips]
  );

  const handleDeleteTrip = async (trip) => {
    if (String(trip._id || "").startsWith("local-draft-")) {
      const confirmed = window.confirm(`Delete the ${trip.city} draft?`);

      if (!confirmed) {
        return;
      }

      setDeletingTripId(trip._id);
      const nextLocalDrafts = removeLocalDraftTrip(trip._id);
      setTrips((current) => {
        const serverTrips = current.filter((item) => !String(item._id || "").startsWith("local-draft-"));
        return [...nextLocalDrafts, ...serverTrips];
      });
      setDeletingTripId("");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(`Delete the ${trip.city} trip?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTripId(trip._id);
      await axios.delete(`${API_BASE_URL}/api/trips/${trip._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips((current) => current.filter((item) => item._id !== trip._id));
      setExpandedTripId((current) => (current === trip._id ? null : current));
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete trip.");
    } finally {
      setDeletingTripId("");
    }
  };

  const handleEditTrip = (trip) => {
    navigate("/itinerary", { state: trip });
  };

  const toggleExpandTrip = (tripId) => {
    setExpandedTripId((current) => (current === tripId ? null : tripId));
  };

  return (
    <section className="planx-page">
      <div className="planx-page-content max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="planx-kicker">
            Trip Dashboard
          </span>
          <h1 className="planx-heading mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            My Trips
          </h1>
          <p className="planx-subtle mt-4 text-lg leading-8">
            Manage and revisit your travel plans.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-red-200/60 bg-[rgba(255,255,255,0.72)] px-5 py-4 text-center text-sm font-medium text-red-700 backdrop-blur-[18px]">
            {error}
          </div>
        )}

        {!error && trips.length === 0 && (
          <div className="planx-panel mx-auto mt-12 max-w-3xl rounded-[36px] px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-950">You haven't planned any trips yet.</h2>
            <p className="planx-subtle mt-3 text-base leading-7">
              Start with TripWise Planner and build your first itinerary in just a few steps.
            </p>
            <button
              type="button"
              onClick={() => navigate("/plan-trip")}
              className="planx-button mt-8 px-6 py-3 text-sm"
            >
              Plan Your First Trip
            </button>
          </div>
        )}

        {trips.length > 0 && (
          <div className="mt-14">
            <div className="space-y-12">
              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="planx-kicker">Upcoming trips</p>
                    <h2 className="mt-4 text-3xl font-semibold text-white">Ready to travel</h2>
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {upcomingTrips.map((trip) => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      mode="upcoming"
                      expanded={expandedTripId === trip._id}
                      onToggleExpand={toggleExpandTrip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      deleting={deletingTripId === trip._id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="planx-kicker">Recent and draft trips</p>
                    <h2 className="mt-4 text-3xl font-semibold text-white">Trips still taking shape</h2>
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {draftTrips.map((trip) => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      mode="draft"
                      expanded={expandedTripId === trip._id}
                      onToggleExpand={toggleExpandTrip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      deleting={deletingTripId === trip._id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyTrips;
