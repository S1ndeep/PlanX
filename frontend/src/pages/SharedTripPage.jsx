import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TripWorkspace from "../components/TripWorkspace.jsx";
import { API_BASE_URL } from "../utils/auth.js";

const buildRatingLabel = (rating = 0) => `${rating}/5`;

const SharedTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [importState, setImportState] = useState({ loading: false, message: "" });
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

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

  useEffect(() => {
    if (!tripData?.owner || !currentUserId) {
      return;
    }

    const nextExistingReview =
      tripData.owner.reviews?.find((review) => review.reviewerId === currentUserId) || null;

    if (nextExistingReview) {
      setReviewForm({
        rating: nextExistingReview.rating,
        comment: nextExistingReview.comment || ""
      });
    }
  }, [currentUserId, tripData]);

  useEffect(() => {
    if (!token || !tripData?._id || !currentUserId) {
      return;
    }

    if (String(tripData.userId || "") === String(currentUserId)) {
      setImportState({ loading: false, message: "This shared trip is already in your My Trips." });
      return;
    }

    let isActive = true;

    const importTrip = async () => {
      try {
        setImportState({ loading: true, message: "" });
        const response = await axios.post(
          `${API_BASE_URL}/api/trips/${tripData._id}/import`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!isActive) {
          return;
        }

        setImportState({
          loading: false,
          message: response.data?.message || "Trip added to your account."
        });
      } catch (importError) {
        if (!isActive) {
          return;
        }

        setImportState({
          loading: false,
          message: importError.response?.data?.message || "Unable to add this trip to your account right now."
        });
      }
    };

    importTrip();

    return () => {
      isActive = false;
    };
  }, [currentUserId, token, tripData?._id, tripData?.userId]);

  if (error) {
    return <div className="px-6 py-16 text-center text-slate-500">{error}</div>;
  }

  if (!tripData) {
    return <div className="px-6 py-16 text-center text-slate-500">Loading trip...</div>;
  }

  const owner = tripData.owner || null;
  const existingReview = owner?.reviews?.find((review) => review.reviewerId === currentUserId) || null;
  const canReview = Boolean(token && owner?.id && currentUserId && owner.id !== currentUserId);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!owner?.id) {
      return;
    }

    setReviewMessage("");
    setIsSubmittingReview(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/${owner.id}/reviews`,
        reviewForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const nextOwner = response.data?.user || owner;
      setTripData((current) => ({
        ...current,
        owner: nextOwner
      }));
      setReviewMessage(response.data?.message || "Review submitted.");
    } catch (submitError) {
      setReviewMessage(submitError.response?.data?.message || "Unable to submit review right now.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="pb-12">
      <TripWorkspace initialData={tripData} readOnly />

      {owner && (
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(145deg,rgba(10,34,42,0.92),rgba(17,56,67,0.84))] p-6 shadow-[0_26px_80px_rgba(3,16,24,0.34)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="min-w-0 flex-1 rounded-[28px] border border-white/10 bg-white/6 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8edcff]">
                  Trip creator
                </p>
                <div className="mt-3 flex items-center gap-4">
                  {owner.profilePicture ? (
                    <img
                      src={owner.profilePicture}
                      alt={owner.name}
                      className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#93e7ff,#2fb8e2)] text-2xl font-semibold text-[#08313a] shadow-[0_16px_35px_rgba(77,212,255,0.25)]">
                      {owner.name?.slice(0, 1)?.toUpperCase() || "T"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold text-white sm:text-3xl">{owner.name}</h2>
                    <p className="mt-1 text-sm text-white/65">
                      {owner.reviewCount} {owner.reviewCount === 1 ? "review" : "reviews"} | {owner.averageRating.toFixed(1)} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#7cdfff]/20 bg-[radial-gradient(circle_at_top,rgba(115,223,255,0.16),rgba(255,255,255,0.04))] px-6 py-5 text-sm text-white/70 lg:min-w-[220px]">
                <p className="font-semibold uppercase tracking-[0.18em] text-white/65">Community rating</p>
                <p className="mt-3 text-4xl font-semibold text-[#8edcff]">{buildRatingLabel(owner.averageRating.toFixed(1))}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
                  Based on {owner.reviewCount} {owner.reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {canReview && (
              <form
                onSubmit={handleSubmitReview}
                className="mt-6 rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-5 sm:p-6"
              >
                <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-end">
                  <div className="md:w-40">
                    <label className="mb-2 block text-sm font-semibold text-white/78">
                      Your rating
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          rating: Number(event.target.value)
                        }))
                      }
                      className="w-full rounded-[18px] border border-white/12 bg-[rgba(6,24,30,0.82)] px-4 py-3 text-sm text-white outline-none transition focus:border-[#53d6f7]"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} star{value === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-white/78">
                      Short review
                    </label>
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          comment: event.target.value
                        }))
                      }
                      placeholder="Share what others should know about planning with this traveler."
                      className="w-full rounded-[18px] border border-white/12 bg-[rgba(6,24,30,0.82)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#53d6f7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="rounded-[18px] bg-[linear-gradient(135deg,#1ec7f3,#53d6f7)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:opacity-70"
                  >
                    {isSubmittingReview ? "Saving..." : existingReview ? "Update Review" : "Post Review"}
                  </button>
                </div>

                {reviewMessage && (
                  <p className="mt-3 text-sm text-[#9ce8ff]">{reviewMessage}</p>
                )}
              </form>
            )}

            {!token && (
              <p className="mt-6 rounded-[20px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                Log in to leave a review for this trip creator.
              </p>
            )}

            <div className="mt-6">
              {token && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-4 text-sm text-white/72">
                  <p className="max-w-2xl">
                    {importState.loading
                      ? "Adding this shared trip to your My Trips..."
                      : importState.message || "Open this trip once and we will save it to your account."}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/my-trips")}
                    className="rounded-[16px] border border-[#8edcff]/30 bg-[#0d3f49] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#53d6f7] hover:bg-[#145765]"
                  >
                    Open My Trips
                  </button>
                </div>
              )}
              <h3 className="text-lg font-semibold text-white">Traveler reviews</h3>
              {owner.reviews?.length > 0 ? (
                <div className="mt-4 grid gap-4">
                  {owner.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {review.reviewerProfilePicture ? (
                            <img
                              src={review.reviewerProfilePicture}
                              alt={review.reviewerName}
                              className="h-11 w-11 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                              {review.reviewerName?.slice(0, 1)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{review.reviewerName}</p>
                            <p className="text-sm text-[#8edcff]">{buildRatingLabel(review.rating)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-white/42">
                          {new Date(review.updatedAt || review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm leading-7 text-white/72">{review.comment}</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/48">No reviews yet.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SharedTripPage;
