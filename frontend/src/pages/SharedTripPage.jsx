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
      {owner && (
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-md">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#147ea2]">
                  Trip creator
                </p>
                <div className="mt-3 flex items-center gap-4">
                  {owner.profilePicture ? (
                    <img
                      src={owner.profilePicture}
                      alt={owner.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dff7ff] text-lg font-semibold text-[#147ea2]">
                      {owner.name?.slice(0, 1)?.toUpperCase() || "T"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">{owner.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {owner.reviewCount} {owner.reviewCount === 1 ? "review" : "reviews"} | {owner.averageRating.toFixed(1)} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Community rating</p>
                <p className="mt-2 text-lg text-[#147ea2]">{buildRatingLabel(owner.averageRating.toFixed(1))}</p>
              </div>
            </div>

            {canReview && (
              <form onSubmit={handleSubmitReview} className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="md:w-40">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                      className="w-full rounded-[16px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#43cbea]"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} star{value === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                      className="w-full rounded-[16px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#43cbea]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="rounded-[18px] bg-[#0b3b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#147ea2] disabled:opacity-70"
                  >
                    {isSubmittingReview ? "Saving..." : existingReview ? "Update Review" : "Post Review"}
                  </button>
                </div>

                {reviewMessage && (
                  <p className="mt-3 text-sm text-slate-600">{reviewMessage}</p>
                )}
              </form>
            )}

            {!token && (
              <p className="mt-6 text-sm text-slate-600">
                Log in to leave a review for this trip creator.
              </p>
            )}

            <div className="mt-6">
              {token && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p>
                    {importState.loading
                      ? "Adding this shared trip to your My Trips..."
                      : importState.message || "Open this trip once and we will save it to your account."}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/my-trips")}
                    className="rounded-[14px] bg-[#0b3b43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#147ea2]"
                  >
                    Open My Trips
                  </button>
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-950">Traveler reviews</h3>
              {owner.reviews?.length > 0 ? (
                <div className="mt-4 grid gap-4">
                  {owner.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[22px] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {review.reviewerProfilePicture ? (
                            <img
                              src={review.reviewerProfilePicture}
                              alt={review.reviewerName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                              {review.reviewerName?.slice(0, 1)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{review.reviewerName}</p>
                            <p className="text-sm text-[#147ea2]">{buildRatingLabel(review.rating)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(review.updatedAt || review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <TripWorkspace initialData={tripData} readOnly />
    </div>
  );
};

export default SharedTripPage;
