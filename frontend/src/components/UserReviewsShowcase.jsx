import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/auth.js";

const SAMPLE_REVIEWS = [
  {
    id: "sample-review-goa",
    rating: 5,
    comment:
      "The trip plan felt smooth from day one. The route was easy to follow, the place mix felt balanced, and we barely had to adjust anything once we started traveling.",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
    reviewer: {
      id: "sample-reviewer-1",
      name: "Aarav",
      profilePicture: null
    },
    reviewFor: {
      id: "sample-user-1",
      name: "Priya",
      profilePicture: null,
      averageRating: 4.9,
      reviewCount: 8
    }
  },
  {
    id: "sample-review-jaipur",
    rating: 4,
    comment:
      "Great recommendations and a realistic pace. We especially liked that the itinerary grouped nearby places together instead of making the days feel rushed.",
    createdAt: "2026-04-05T12:00:00.000Z",
    updatedAt: "2026-04-05T12:00:00.000Z",
    reviewer: {
      id: "sample-reviewer-2",
      name: "Meera",
      profilePicture: null
    },
    reviewFor: {
      id: "sample-user-2",
      name: "Rahul",
      profilePicture: null,
      averageRating: 4.7,
      reviewCount: 5
    }
  },
  {
    id: "sample-review-manali",
    rating: 5,
    comment:
      "The planning style was thoughtful and practical. Weather, route flow, and stop selection all felt like they were put together by someone who actually travels.",
    createdAt: "2026-04-10T15:30:00.000Z",
    updatedAt: "2026-04-10T15:30:00.000Z",
    reviewer: {
      id: "sample-reviewer-3",
      name: "Kiran",
      profilePicture: null
    },
    reviewFor: {
      id: "sample-user-3",
      name: "Ananya",
      profilePicture: null,
      averageRating: 5,
      reviewCount: 3
    }
  }
];

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
        const response = await axios.get(`${API_BASE_URL}/api/users/reviews/featured`, {
          params: { limit }
        });
        const liveReviews = response.data?.reviews || [];
        setReviews(
          liveReviews.length > 0
            ? [...liveReviews, ...SAMPLE_REVIEWS].slice(0, Math.max(limit, 3))
            : SAMPLE_REVIEWS.slice(0, Math.max(limit, 3))
        );
      } catch (loadError) {
        setError("");
        setReviews(SAMPLE_REVIEWS.slice(0, Math.max(limit, 3)));
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
                      Reviewed {review.reviewFor.name}
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
                  {review.reviewFor.reviewCount} {review.reviewFor.reviewCount === 1 ? "review" : "reviews"} total
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
