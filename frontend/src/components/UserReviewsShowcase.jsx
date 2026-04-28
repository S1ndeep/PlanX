import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/auth.js";

const UserReviewsShowcase = ({
  title = "Traveler reviews",
  eyebrow = "Community feedback",
  description = "See what travelers are saying about other planners in TripWise.",
  limit = 3,
  light = false
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const [userResponse, tripResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users/reviews/featured`, {
            params: { limit }
          }),
          axios.get(`${API_BASE_URL}/api/trips/reviews/featured`, {
            params: { limit }
          })
        ]);
        const liveReviews = [
          ...(userResponse.data?.reviews || []),
          ...(tripResponse.data?.reviews || [])
        ]
          .sort((firstReview, secondReview) => {
            const firstTime = new Date(firstReview.updatedAt || firstReview.createdAt || 0).getTime();
            const secondTime = new Date(secondReview.updatedAt || secondReview.createdAt || 0).getTime();
            return secondTime - firstTime;
          })
          .slice(0, Math.max(limit, 3));
        setReviews(liveReviews);
      } catch (loadError) {
        setError("Unable to load traveler reviews right now.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [limit]);

  const shellClassName = light
    ? "rounded-[34px] border border-white/25 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]"
    : "rounded-[34px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md";

  const eyebrowClassName = light
    ? "text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]"
    : "text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]";

  const titleClassName = light
    ? "mt-3 text-3xl font-semibold text-slate-950"
    : "mt-4 text-3xl font-semibold leading-tight sm:text-4xl";

  const descriptionClassName = light
    ? "mt-4 max-w-3xl text-base leading-8 text-slate-600"
    : "mt-4 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base";

  const cardClassName = light
    ? "rounded-[28px] border border-white/50 bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
    : "rounded-[28px] border border-white/10 bg-[#0b3b43]/64 p-5";

  const textMutedClassName = light ? "text-slate-500" : "text-slate-300";
  const textBodyClassName = light ? "text-slate-600" : "text-slate-200";
  const textHeadingClassName = light ? "text-slate-950" : "text-white";

  return (
    <section className={shellClassName}>
      <p className={eyebrowClassName}>{eyebrow}</p>
      <h2 className={titleClassName}>{title}</h2>
      <p className={descriptionClassName}>{description}</p>

      {loading && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: Math.min(limit, 3) }).map((_, index) => (
            <div key={`review-skeleton-${index}`} className={cardClassName}>
              <div className="h-4 w-24 rounded bg-slate-200/60" />
              <div className="mt-4 h-16 rounded bg-slate-200/50" />
              <div className="mt-4 h-4 w-32 rounded bg-slate-200/60" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className={`mt-8 rounded-[24px] border px-5 py-4 text-sm ${light ? "border-red-200 bg-red-50 text-red-700" : "border-white/10 bg-white/5 text-slate-200"}`}>
          {error}
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className={`mt-8 rounded-[24px] border px-5 py-4 text-sm ${light ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/10 bg-white/5 text-slate-300"}`}>
          No traveler reviews have been shared yet.
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className={cardClassName}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.reviewer.profilePicture ? (
                    <img
                      src={review.reviewer.profilePicture}
                      alt={review.reviewer.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold ${light ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white"}`}>
                      {review.reviewer.name?.slice(0, 1)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className={`font-semibold ${textHeadingClassName}`}>{review.reviewer.name}</p>
                    <p className={`text-sm ${textMutedClassName}`}>
                      {review.sourceType === "trip" ? `Reviewed trip to ${review.reviewFor.name}` : `Reviewed ${review.reviewFor.name}`}
                    </p>
                  </div>
                </div>
                <span className={light ? "rounded-full bg-[#eaf9ff] px-3 py-1 text-xs font-semibold text-[#147ea2]" : "rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#8edcff]"}>
                  {review.rating}/5
                </span>
              </div>

              <p className={`mt-4 text-sm leading-7 ${textBodyClassName}`}>
                {review.comment}
              </p>

              <div className={`mt-4 flex items-center justify-between text-xs ${textMutedClassName}`}>
                <span>
                  {review.sourceType === "trip"
                    ? review.budgetSpent !== null && review.budgetSpent !== undefined
                      ? `Budget spent: INR ${Number(review.budgetSpent).toLocaleString()}`
                      : "Trip review"
                    : `${review.reviewFor.reviewCount} ${review.reviewFor.reviewCount === 1 ? "review" : "reviews"} total`}
                </span>
                <span>{new Date(review.updatedAt || review.createdAt).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserReviewsShowcase;
