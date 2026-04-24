import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WriteReviewModal from './WriteReviewModal.jsx';

const INITIAL_MOCK_REVIEWS = [
  { 
    _id: "m1", 
    userName: "Rahul", 
    location: "Mumbai", 
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", 
    rating: 5, 
    comment: "Absolutely loved the architecture and the vibrant local markets. A must-visit for culture enthusiasts!", 
    visitType: "Family" 
  },
  { 
    _id: "m2", 
    userName: "Priya", 
    location: "Delhi", 
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", 
    rating: 5, 
    comment: "The sunsets were magical. Walking around the lake was the highlight of our 3-day weekend trip.", 
    visitType: "Couple" 
  },
  { 
    _id: "m3", 
    userName: "Arjun", 
    location: "Bangalore", 
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", 
    rating: 4, 
    comment: "Great place with rich history. The local food is incredible, definitely try the street food stalls.", 
    visitType: "Solo" 
  }
];

const DestinationReviews = ({ cityName }) => {
  const [reviews, setReviews] = useState(INITIAL_MOCK_REVIEWS);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!cityName) return;
    
    const fetchReviews = async () => {
      try {
        const revRes = await axios.get(`http://localhost:5000/api/reviews/${cityName}`);
        if (revRes.data && revRes.data.length > 0) {
          setReviews(revRes.data);
        }
        
        const sumRes = await axios.get(`http://localhost:5000/api/reviews/summary/${cityName}`);
        if (sumRes.data.totalReviews > 0) {
          setSummary(sumRes.data);
        }
      } catch (err) {
        console.error("Failed fetching reviews:", err);
      }
    };
    
    fetchReviews();
  }, [cityName]);

  const handleReviewAdded = (newReview) => {
    setReviews(current => {
       if (current === INITIAL_MOCK_REVIEWS) {
          return [newReview];
       }
       return [newReview, ...current];
    });
    setSummary(s => ({
       averageRating: s.totalReviews === 0 
           ? newReview.rating 
           : ((s.averageRating * s.totalReviews) + newReview.rating) / (s.totalReviews + 1),
       totalReviews: s.totalReviews + 1
    }));
  };

  return (
    <section className="mt-16 animate-[fadeUp_1000ms_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff] mb-2">
            Community Experiences {summary.totalReviews > 0 ? `(${summary.totalReviews} Reviews)` : ""}
          </p>
          <h3 className="text-3xl font-semibold text-white">What Travelers Are Saying</h3>
          {summary.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-2">
               <span className="text-xl font-bold text-[#1ec7f3]">{summary.averageRating.toFixed(1)}</span>
               <span className="text-[#1ec7f3] text-lg">★</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full border border-[#8edcff]/40 bg-[#0b3b43]/60 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
          >
            Write a Review
          </button>
          <button 
            onClick={() => alert("Full reviews page under construction.")}
            className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8edcff] transition hover:text-[#1ec7f3]"
          >
            View All Reviews →
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pt-2 pb-6">
        {reviews.map((review) => (
          <div 
            key={review._id}
            className="relative flex flex-col justify-between shrink-0 snap-center w-[300px] md:w-[360px] lg:w-[calc(33.333%-16px)] rounded-[20px] border border-white/20 bg-[rgba(16,53,61,0.72)] p-6 shadow-[0_24px_60px_rgba(3,18,24,0.18)] backdrop-blur-[24px] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(30,199,243,0.12)] hover:border-white/30 group"
          >
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img 
                  src={review.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md"
                />
                <div>
                  <h4 className="text-white font-semibold text-base leading-tight">{review.userName}</h4>
                  <p className="text-[12px] text-[#8edcff]/80 font-medium tracking-wide uppercase mt-0.5">{review.visitType || "Traveler"}</p>
                </div>
              </div>
              
              <div className="flex text-[#1ec7f3] text-[13px] mb-3">
                {'★'.repeat(Math.round(review.rating))}{'☆'.repeat(5 - Math.round(review.rating))}
              </div>
              
              <p className="text-slate-200 text-[14px] leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                "{review.comment}"
              </p>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <span className="inline-block rounded-full bg-white/10 border border-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-[#8edcff]">
                {review.visitType || "Review"}
              </span>
              <span className="text-[10px] text-white/40">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Just now"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placeId={cityName}
        onReviewAdded={handleReviewAdded}
      />
    </section>
  );
};

export default DestinationReviews;
