import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const WriteReviewModal = ({ isOpen, onClose, placeId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [visitType, setVisitType] = useState("Other");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please share your experience");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        {
          placeId,
          rating,
          comment,
          visitType,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (onReviewAdded) {
        onReviewAdded(response.data);
      }
      
      onClose(); // Automatically close on success
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setError(serverMsg || (err.message === "Network Error" ? "Network error: Make sure the backend server is running." : "Failed to post review. Are you logged in?"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60" 
        onClick={onClose} 
        aria-label="Close Modal"
      />
      
      <div className="relative w-full max-w-lg origin-bottom animate-[fadeUp_300ms_ease-out] rounded-[20px] border border-white/20 bg-[#062f35]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-white">Share Your Experience</h2>
        <p className="mt-2 text-sm text-slate-300">
          How was your visit to <span className="font-medium capitalize text-[#8edcff]">{placeId}</span>?
        </p>

        {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium text-slate-200">Rate your experience</label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <svg 
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating) ? "text-[#1ec7f3]" : "text-white/20"
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label htmlFor="comment" className="text-sm font-medium text-slate-200">Review</label>
            <textarea
              id="comment"
              rows={4}
              maxLength={300}
              placeholder="What did you like? Any tips for other travelers?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-slate-400 focus:border-[#8edcff] focus:outline-none focus:ring-1 focus:ring-[#8edcff]"
            />
            <div className="mt-1 flex justify-end text-xs text-slate-400">
              {comment.length}/300
            </div>
          </div>

          {/* Visit Type */}
          <div>
            <label htmlFor="visitType" className="text-sm font-medium text-slate-200">Visit Type</label>
            <select
              id="visitType"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="mt-2 w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 py-3 text-sm text-white focus:border-[#8edcff] focus:outline-none focus:ring-1 focus:ring-[#8edcff]"
            >
              <option value="Solo" className="bg-[#062f35]">Solo</option>
              <option value="Couple" className="bg-[#062f35]">Couple</option>
              <option value="Family" className="bg-[#062f35]">Family</option>
              <option value="Friends" className="bg-[#062f35]">Friends</option>
              <option value="Other" className="bg-[#062f35]">Other</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-full border border-white/20 bg-transparent py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#1ec7f3] to-[#8edcff] py-3 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Posting..." : "Post Review"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default WriteReviewModal;
