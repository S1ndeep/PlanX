import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import TripCard from "../components/TripCard.jsx";
import { isDraftTrip } from "../components/tripUtils.js";
import {
  loadLocalDraftTrips,
  removeLocalDraftTrip
} from "../components/localDraftTrips.js";
import WriteReviewModal from "../components/WriteReviewModal.jsx";

const API_BASE_URL = "http://localhost:5000";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [deletingTripId, setDeletingTripId] = useState("");
  const [reviewModalData, setReviewModalData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadTrips = async () => {
      const localDraftTrips = loadLocalDraftTrips();

      try {
        if (!token) {
          setTrips(localDraftTrips);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverTrips = response.data.trips || [];
        setTrips([...localDraftTrips, ...serverTrips]);
      } catch (loadError) {
        setTrips(localDraftTrips);
        setError(localDraftTrips.length > 0 ? "" : "Unable to load trips.");
      }
    };

    loadTrips();
  }, [token]);

  useEffect(() => {
    if (!location.state?.savedTripId) {
      return;
    }

    const nextState = { ...location.state };
    delete nextState.savedTripId;
    window.history.replaceState(nextState, "");
  }, [location.state]);

  const completedTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (trip.status === "completed") return true;
      if (isDraftTrip(trip)) return false;
      const startDate = new Date(trip.startDate || trip.createdAt || Date.now());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (trip.days || 1));
      return endDate < new Date();
    });
  }, [trips]);

  const upcomingTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (trip.status === "completed") return false;
      if (isDraftTrip(trip)) return false;
      const startDate = new Date(trip.startDate || trip.createdAt || Date.now());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (trip.days || 1));
      return endDate >= new Date();
    });
  }, [trips]);

  const draftTrips = useMemo(
    () => trips.filter((trip) => trip.status !== "completed" && isDraftTrip(trip)),
    [trips]
  );

  const orderedTrips = useMemo(
    () => [...upcomingTrips, ...draftTrips],
    [draftTrips, upcomingTrips]
  );

  const savedTripId = location.state?.savedTripId || "";

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
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete trip.");
    } finally {
      setDeletingTripId("");
    }
  };

  const handleEditTrip = (trip) => {
    navigate("/itinerary", { state: trip });
  };

  const handleViewTrip = (trip) => {
    navigate("/trip-view", { state: trip });
  };

  const handleAddReview = (trip) => {
    setReviewModalData({ placeId: trip.city || "your destination" });
  };

  const handleMarkCompleted = async (trip) => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 20); // Push 20 days into the past
    
    // Update local drafts
    if (String(trip._id || "").startsWith("local-draft-")) {
      const localDrafts = loadLocalDraftTrips();
      const updatedDrafts = localDrafts.map((d) => 
        d._id === trip._id ? { ...d, startDate: oldDate.toISOString() } : d
      );
      localStorage.setItem("tripwise_draft_trips", JSON.stringify(updatedDrafts));
      
      setTrips(current => current.map(item => 
        item._id === trip._id ? { ...item, startDate: oldDate.toISOString(), status: "completed" } : item
      ));
      return;
    }
    
    // Update server trips
    if (!token) return;
    
    try {
      await axios.put(`${API_BASE_URL}/api/trips/${trip._id}`, {
        status: "completed",
        startDate: oldDate.toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update active memory state so it moves instantly
      setTrips(current => current.map(item => 
        item._id === trip._id ? { ...item, startDate: oldDate.toISOString(), status: "completed" } : item
      ));
    } catch (error) {
       setError("Failed to mark trip as completed. Are you logged in?");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-10 lg:pt-16">
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80"
        alt="Mountain lake landscape with evergreen forest"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[rgba(4,24,31,0.14)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-white/35 bg-[rgba(255,255,255,0.16)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/85 backdrop-blur-md">
            Trip Dashboard
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            My Trips
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/72">
            Manage and revisit your travel plans.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-red-200/60 bg-[rgba(255,255,255,0.72)] px-5 py-4 text-center text-sm font-medium text-red-700 backdrop-blur-[18px]">
            {error}
          </div>
        )}

        {!error && trips.length === 0 && (
          <div className="mx-auto mt-12 max-w-3xl rounded-[36px] border border-white/45 bg-[rgba(255,255,255,0.56)] px-8 py-12 text-center shadow-[0_28px_120px_rgba(15,23,42,0.14)] backdrop-blur-[26px]">
            <h2 className="text-2xl font-semibold text-slate-950">You haven't planned any trips yet.</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Start with TripWise Planner and build your first itinerary in just a few steps.
            </p>
            <button
              type="button"
              onClick={() => navigate("/plan-trip")}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/60 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
            >
              Plan Your First Trip
            </button>
          </div>
        )}

        {trips.length > 0 && (
            <div className="mt-14">
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {orderedTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className={
                      savedTripId && savedTripId === trip._id
                        ? "rounded-[36px] ring-4 ring-[#8edcff]/60 ring-offset-4 ring-offset-transparent"
                        : ""
                    }
                  >
                    <TripCard
                      trip={trip}
                      mode={isDraftTrip(trip) ? "draft" : "upcoming"}
                      onView={handleViewTrip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      onMarkCompleted={handleMarkCompleted}
                      deleting={deletingTripId === trip._id}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTrips.length > 0 && (
            <div className="mt-16 pt-10 border-t border-white/20">
              <h2 className="mb-8 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Completed Trips
              </h2>
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {completedTrips.map((trip) => (
                  <div key={trip._id}>
                    <TripCard
                      trip={trip}
                      mode="completed"
                      onView={handleViewTrip}
                      onAddReview={handleAddReview}
                      onDelete={handleDeleteTrip}
                      deleting={deletingTripId === trip._id}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <WriteReviewModal
            isOpen={!!reviewModalData}
            onClose={() => setReviewModalData(null)}
            placeId={reviewModalData?.placeId}
            onReviewAdded={(review) => {
              alert("Thanks for logging your review!");
            }}
          />
      </div>
    </section>
  );
};

export default MyTrips;
