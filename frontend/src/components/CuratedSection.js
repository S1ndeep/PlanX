import { useState, useEffect } from "react";
import CityCard from "./CityCard.js";

const CuratedSection = () => {
  const [fadeIn, setFadeIn] = useState(false);

  const curatedCities = [
    {
      id: 1,
      name: "Goa",
      description: "Beaches & Nightlife - Pristine coastlines meet vibrant parties",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
      tag: "🏖️ Beach",
    },
    {
      id: 2,
      name: "Jaipur",
      description: "Royal Heritage - Explore magnificent forts and palaces",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
      tag: "🏰 Heritage",
    },
    {
      id: 3,
      name: "Manali",
      description: "Mountains & Snow - Adventure in the Himalayan paradise",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
      tag: "⛰️ Mountain",
    },
    {
      id: 4,
      name: "Rishikesh",
      description: "Spiritual & Adventure - Yoga capital with thrilling river rafting",
      image: "https://images.unsplash.com/photo-1585483959406-376f47db1716?auto=format&fit=crop&w=900&q=80",
      tag: "🧘 Spiritual",
    },
    {
      id: 5,
      name: "Udaipur",
      description: "Romantic Lakes - City of lakes with stunning royal architecture",
      image: "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?auto=format&fit=crop&w=900&q=80",
      tag: "💕 Romantic",
    },
    {
      id: 6,
      name: "Pondicherry",
      description: "French Colonial Charm - Blend of Indian and French cultures",
      image: "https://images.unsplash.com/photo-1589307357838-e9a130d4836b?auto=format&fit=crop&w=900&q=80",
      tag: "🎨 Colonial",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-mainBg py-20 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primaryText mb-4">
            ✨ Places You May Like
          </h2>
          <p className="text-lg text-secondaryText max-w-2xl mx-auto">
            Handpicked destinations curated just for you. From serene beaches to
            majestic mountains, find your perfect escape.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {curatedCities.map((city, index) => (
            <div
              key={city.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CityCard city={city} type="curated" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default CuratedSection;
