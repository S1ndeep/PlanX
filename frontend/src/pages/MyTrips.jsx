import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import TripCard from "../components/TripCard.jsx";
import { isCompletedTrip, isDraftTrip } from "../components/tripUtils.js";
import {
  loadLocalDraftTrips,
  removeLocalDraftTrip,
  updateLocalTripReview,
  updateLocalTripStatus
} from "../components/localDraftTrips.js";
import { API_BASE_URL } from "../utils/auth.js";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [deletingTripId, setDeletingTripId] = useState("");
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    tripId: "",
    city: "",
    rating: 5,
    budgetSpent: "",
    comment: ""
  });
  const [isSavingReview, setIsSavingReview] = useState(false);
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

  const upcomingTrips = useMemo(
    () => trips.filter((trip) => !isDraftTrip(trip) && !isCompletedTrip(trip)),
    [trips]
  );

  const draftTrips = useMemo(
    () => trips.filter((trip) => isDraftTrip(trip) && !isCompletedTrip(trip)),
    [trips]
  );

  const completedTrips = useMemo(
    () => trips.filter((trip) => isCompletedTrip(trip)),
    [trips]
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

  const handleMarkComplete = async (trip) => {
    if (String(trip._id || "").startsWith("local-draft-")) {
      const nextTrips = updateLocalTripStatus(trip._id, "completed");
      setTrips((current) => {
        const serverTrips = current.filter((item) => !String(item._id || "").startsWith("local-draft-"));
        return [...nextTrips, ...serverTrips];
      });
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/trips/${trip._id}/status`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const nextTrip = response.data?.trip;
      setTrips((current) => current.map((item) => (item._id === nextTrip._id ? nextTrip : item)));
    } catch (statusError) {
      setError(statusError.response?.data?.message || "Unable to mark trip as complete.");
    }
  };

  const handleAddReview = (trip) => {
    const existingReview = trip.tripReview || {};
    setReviewModal({
      isOpen: true,
      tripId: trip._id,
      city: trip.city || "Trip",
      rating: existingReview.rating || 5,
      budgetSpent:
        existingReview.budgetSpent !== null && existingReview.budgetSpent !== undefined
          ? String(existingReview.budgetSpent)
          : "",
      comment: existingReview.comment || ""
    });
  };

  const handleReviewFieldChange = (field, value) => {
    setReviewModal((current) => ({
      ...current,
      [field]: value
    }));
  };

  const closeReviewModal = (force = false) => {
    if (isSavingReview && !force) {
      return;
    }

    setReviewModal({
      isOpen: false,
      tripId: "",
      city: "",
      rating: 5,
      budgetSpent: "",
      comment: ""
    });
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    const trip = trips.find((item) => item._id === reviewModal.tripId);

    if (!trip) {
      setError("Trip not found for review.");
      return;
    }

    const parsedRating = Number(reviewModal.rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setError("Please select a rating from 1 to 5.");
      return;
    }

    const normalizedBudgetSpentInput = String(reviewModal.budgetSpent || "").trim();
    const parsedBudgetSpent =
      normalizedBudgetSpentInput === "" ? null : Number(normalizedBudgetSpentInput);

    if (
      parsedBudgetSpent !== null &&
      (!Number.isFinite(parsedBudgetSpent) || parsedBudgetSpent < 0)
    ) {
      setError("Please enter a valid budget spent amount.");
      return;
    }

    const nextReview = {
      rating: parsedRating,
      budgetSpent: parsedBudgetSpent,
      comment: String(reviewModal.comment || "").trim()
    };

    setIsSavingReview(true);

    if (String(trip._id || "").startsWith("local-draft-")) {
      const nextTrips = updateLocalTripReview(trip._id, nextReview);
      setTrips((current) => {
        const serverTrips = current.filter((item) => !String(item._id || "").startsWith("local-draft-"));
        return [...nextTrips, ...serverTrips];
      });
      setIsSavingReview(false);
      closeReviewModal(true);
      return;
    }

    if (!token) {
      setIsSavingReview(false);
      navigate("/login");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/trips/${trip._id}/review`,
        nextReview,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const nextTrip = response.data?.trip;
      setTrips((current) => current.map((item) => (item._id === nextTrip._id ? nextTrip : item)));
      closeReviewModal(true);
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || "Unable to save trip review.");
    } finally {
      setIsSavingReview(false);
    }
  };

  const renderTripSection = (title, description, sectionTrips, mode) => {
    if (sectionTrips.length === 0) {
      return null;
    }

    return (
      <section className="mt-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-3 text-base leading-7 text-white/70">{description}</p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {sectionTrips.map((trip) => (
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
                mode={mode}
                onView={handleViewTrip}
                onEdit={handleEditTrip}
                onMarkComplete={handleMarkComplete}
                onAddReview={handleAddReview}
                onDelete={handleDeleteTrip}
                deleting={deletingTripId === trip._id}
              />
            </div>
          ))}
        </div>
      </section>
    );
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

        {renderTripSection(
          "Upcoming Trips",
          "Trips you are still planning or getting ready to take.",
          upcomingTrips,
          "upcoming"
        )}

        {renderTripSection(
          "Saved Drafts",
          "Quick drafts and unfinished plans you can keep shaping.",
          draftTrips,
          "draft"
        )}

        {renderTripSection(
          "Completed Trips",
          "Trips you finished, with quick actions to revisit and review them.",
          completedTrips,
          "completed"
        )}
      </div>

      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[30px] border border-white/40 bg-[rgba(255,255,255,0.94)] p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-[24px] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                  Completed Trip Review
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                  {reviewModal.city}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Add your rating, written review, and budget spent for this trip.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                disabled={isSavingReview}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rating
                  </label>
                  <select
                    value={reviewModal.rating}
                    onChange={(event) => handleReviewFieldChange("rating", Number(event.target.value))}
                    className="w-full rounded-[18px] border border-[#d8dfeb] bg-white px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Budget Spent
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reviewModal.budgetSpent}
                    onChange={(event) => handleReviewFieldChange("budgetSpent", event.target.value)}
                    placeholder="e.g. 12500"
                    className="w-full rounded-[18px] border border-[#d8dfeb] bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Review
                </label>
                <textarea
                  rows={5}
                  value={reviewModal.comment}
                  onChange={(event) => handleReviewFieldChange("comment", event.target.value)}
                  placeholder="Share what went well, what surprised you, and how the trip felt overall."
                  className="w-full rounded-[18px] border border-[#d8dfeb] bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#43cbea] focus:ring-4 focus:ring-[#bfeefd]"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={isSavingReview}
                  className="rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="rounded-[18px] bg-[#0b3b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#147ea2] disabled:opacity-70"
                >
                  {isSavingReview ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyTrips;
