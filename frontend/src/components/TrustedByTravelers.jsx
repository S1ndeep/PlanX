import { Link } from "react-router-dom";

const reviews = [
  {
    id: 1,
    name: "Ananya Singh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "TripWise completely changed how I plan my travels. The itinerary generation was spot on and saved me hours of research!",
    location: "Tokyo Trip"
  },
  {
    id: 2,
    name: "Aarav Sharma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "The route-aware planning is pure genius. It grouped all my stops perfectly, making my European backpacking trip seamless.",
    location: "Euro Trip"
  },
  {
    id: 3,
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "I love how visual the platform is. Seeing the city highlights before committing to a plan made the whole experience cinematic.",
    location: "Bali Trip"
  },
  {
    id: 4,
    name: "Rohan Desai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "Being able to tweak the generated itinerary gives the perfect balance of AI acceleration and personal touch.",
    location: "New York Trip"
  }
];

const allReviews = [...reviews, ...reviews];

const TrustedByTravelers = () => {
  return (
    <section className="relative mt-24 mb-16 overflow-hidden">
      {/* Background layer with slight contrast */}
      <div className="absolute inset-0 bg-[#0a4952]/20 backdrop-blur-sm pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(6,47,53,0.5)_100%)] pointer-events-none" />
      
      <div className="relative z-10 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16 px-6">
          <h2 className="font-serif text-4xl leading-tight text-white mb-4 sm:text-5xl animate-[fadeUp_800ms_ease-out]">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-lg text-slate-300 animate-[fadeUp_1000ms_ease-out]">
            Real experiences from people who explored with TripWise
          </p>
        </div>

        {/* Carousel / Auto-scroll Area */}
        <div className="relative w-full overflow-hidden py-4 group">
          {/* Fading edges to blend with background */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#073239] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#073239] to-transparent z-20 pointer-events-none" />
          
          <div className="flex gap-6 w-max animate-auto-scroll px-6">
            {allReviews.map((review, idx) => (
              <div 
                key={`${review.id}-${idx}`}
                className="w-[340px] md:w-[380px] rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-8 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-[#0b3b43]/60 hover:shadow-[0_24px_60px_rgba(30,199,243,0.15)] hover:border-white/20"
              >
                <div className="flex items-center gap-4 mb-5">
                  <img 
                    src={review.avatar} 
                    alt={review.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/20 shadow-lg"
                  />
                  <div>
                    <h3 className="text-white font-semibold text-[1.1rem] leading-tight">{review.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex text-[#1ec7f3] text-[0.8rem]">
                        {'★'.repeat(review.rating)}
                      </div>
                      <span className="text-[11px] text-[#8edcff]/70 font-semibold tracking-widest uppercase">— {review.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 text-[15px] leading-relaxed line-clamp-3">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <button 
            onClick={() => alert("Thanks for your interest! The full reviews portal is currently under construction and will be available soon.")}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#8edcff] transition-all hover:text-[#1ec7f3] hover:gap-3 group-hover:underline decoration-transparent hover:decoration-current underline-offset-4"
          >
            View More Reviews <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrustedByTravelers;
