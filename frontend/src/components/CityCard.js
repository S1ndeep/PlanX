import { Link } from "react-router-dom";

// Fallback image generator based on city name or type
const getFallbackImage = (cityName, tag = "") => {
  const name = cityName.toLowerCase();
  
  // Specific city mappings
  const cityImageMap = {
    goa: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    jaipur: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
    manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
    rishikesh: "https://images.unsplash.com/photo-1585483959406-376f47db1716?auto=format&fit=crop&w=900&q=80",
    udaipur: "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?auto=format&fit=crop&w=900&q=80",
    pondicherry: "https://images.unsplash.com/photo-1589307357838-e9a130d4836b?auto=format&fit=crop&w=900&q=80",
    mumbai: "https://images.unsplash.com/photo-1598434192043-71111c1b3f6f?auto=format&fit=crop&w=900&q=80",
    delhi: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    bengaluru: "https://images.unsplash.com/photo-1588414744731-660b5b0b987a?auto=format&fit=crop&w=900&q=80",
    bangalore: "https://images.unsplash.com/photo-1588414744731-660b5b0b987a?auto=format&fit=crop&w=900&q=80",
    hyderabad: "https://images.unsplash.com/photo-1600537341806-2b7f1f8d8b73?auto=format&fit=crop&w=900&q=80",
    chennai: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
    kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80",
    kochi: "https://images.unsplash.com/photo-1661808123851-11e30ab30c34?auto=format&fit=crop&w=900&q=80",
    varanasi: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80"
  };
  
  // Check if city has specific mapping
  if (cityImageMap[name]) {
    return cityImageMap[name];
  }
  
  // Fallback based on tag
  const tagLower = tag.toLowerCase();
  if (tagLower.includes("beach")) {
    return `https://source.unsplash.com/featured/900x600/?beach,india`;
  }
  if (tagLower.includes("heritage") || tagLower.includes("royal")) {
    return `https://source.unsplash.com/featured/900x600/?palace,india`;
  }
  if (tagLower.includes("mountain") || tagLower.includes("snow")) {
    return `https://source.unsplash.com/featured/900x600/?mountains,himalaya`;
  }
  if (tagLower.includes("spiritual")) {
    return `https://source.unsplash.com/featured/900x600/?temple,india`;
  }
  if (tagLower.includes("lake") || tagLower.includes("romantic")) {
    return `https://source.unsplash.com/featured/900x600/?lake,india`;
  }
  
  // Default fallback with city name
  return `https://source.unsplash.com/featured/900x600/?${encodeURIComponent(cityName)},india`;
};

const CityCard = ({ city, type = "default" }) => {
  const imageUrl = city.image || getFallbackImage(city.name, city.tag || "");

  if (type === "trending") {
    return (
      <div className="min-w-[320px] bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl group border border-gray-100">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = getFallbackImage(city.name, city.tag || "");
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Trending Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#1ec7f3] to-[#53d6f7] px-4 py-2 rounded-full shadow-lg">
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <span>🔥</span>
              <span>Trending</span>
            </span>
          </div>
          
          {/* City Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
            <p className="text-sm text-white/90 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {city.state}
            </p>
          </div>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-white to-gray-50">
          <p className="text-sm text-[#6B7280] mb-4 line-clamp-2 leading-relaxed">{city.description}</p>
          <Link
            to={`/destination/${city.name}`}
            className="group/btn inline-block w-full text-center bg-gradient-to-r from-[#1ec7f3] to-[#53d6f7] hover:from-[#53d6f7] hover:to-[#1ec7f3] text-slate-950 font-bold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Explore Now</span>
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (type === "curated") {
    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl group border border-gray-100">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = getFallbackImage(city.name, city.tag || "");
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {city.tag && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-[#1ec7f3] to-[#53d6f7] text-slate-950 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {city.tag}
            </div>
          )}
          
          {/* City Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-white to-gray-50">
          <p className="text-[#6B7280] mb-6 leading-relaxed">
            {city.description}
          </p>
          <Link
            to={`/destination/${city.name}`}
            className="group/btn inline-block w-full text-center bg-gradient-to-r from-[#1ec7f3] to-[#53d6f7] hover:from-[#53d6f7] hover:to-[#1ec7f3] text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Explore {city.name}</span>
              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (type === "search") {
    return (
      <div className="bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 p-6 border border-gray-100">
        <div className="flex flex-col h-full">
          {/* City Name */}
          <h3 className="text-2xl font-bold text-primaryText mb-3">
            {city.name}
          </h3>
          
          {/* State/Region */}
          <div className="flex items-center mb-3">
            <span className="text-base text-secondaryText">
              📍 {city.region || city.state || "India"}
            </span>
          </div>
          
          {/* Population */}
          {city.population && (
            <p className="text-sm text-secondaryText/70 mb-3">
              Population: <span className="font-medium">{city.population.toLocaleString()}</span>
            </p>
          )}
          
          {/* Coordinates */}
          {city.latitude && city.longitude && (
            <p className="text-xs text-secondaryText/60 mb-4 flex items-center gap-1">
              <span>🌐</span>
              <span>{city.latitude.toFixed(4)}°, {city.longitude.toFixed(4)}°</span>
            </p>
          )}
          
          {/* View Details Button */}
          <div className="mt-auto pt-4">
            <Link 
              to={`/destination/${city.name}`}
              className="block w-full bg-[#1ec7f3] hover:bg-[#53d6f7] text-slate-950 text-center font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CityCard;
