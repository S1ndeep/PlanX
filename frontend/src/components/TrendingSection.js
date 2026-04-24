import { useState, useEffect } from "react";
import CityCard from "./CityCard.js";

const TrendingSection = () => {
  const [loading, setLoading] = useState(true);
  const [trendingCities, setTrendingCities] = useState([]);

  // Temporary trending cities data
  const tempTrendingData = [
    {
      id: 1,
      name: "Mumbai",
      state: "Maharashtra",
      description: "The city of dreams with stunning beaches and vibrant nightlife.",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Delhi",
      state: "Delhi",
      description: "Rich historical heritage with magnificent monuments and culture.",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Jaipur",
      state: "Rajasthan",
      description: "The Pink City known for majestic palaces and colorful markets.",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 4,
      name: "Goa",
      state: "Goa",
      description: "Paradise beaches, Portuguese architecture, and vibrant parties.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 5,
      name: "Bengaluru",
      state: "Karnataka",
      description: "India's Silicon Valley with pleasant weather and gardens.",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 6,
      name: "Hyderabad",
      state: "Telangana",
      description: "City of Pearls blending history with modern technology.",
      image: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=900&q=80",
    },
  ];

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setTrendingCities(tempTrendingData);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-white py-20 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-3">
            🔥 Trending Right Now
          </h2>
          <p className="text-lg text-[#6B7280]">
            Most searched cities this week
          </p>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="min-w-[320px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide hover:scrollbar-default scroll-smooth">
            {trendingCities.map((city, index) => (
              <div
                key={city.id}
                className="animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CityCard city={city} type="trending" />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default TrendingSection;
