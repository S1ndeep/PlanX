import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

const DestinationDetails = () => {
  const { cityName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:5000/api/destination/${cityName}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching destination details:', err);
        setError('Failed to load destination details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (cityName) {
      fetchDestinationDetails();
    }
  }, [cityName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mainBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primaryText text-lg">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-mainBg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 text-lg mb-4">{error || 'Destination not found'}</p>
          <Link 
            to="/explore" 
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mainBg">
      {/* Hero Section with Image */}
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-orange-500 to-pink-500">
        {data.image ? (
          <img 
            src={data.image} 
            alt={data.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500">
            <h1 className="text-5xl md:text-7xl font-bold text-white">{data.name}</h1>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{data.name}</h1>
            <Link 
              to="/explore" 
              className="inline-flex items-center text-white hover:text-orange-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Explore
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-primaryText mb-4">About {data.name}</h2>
              <p className="text-secondaryText leading-relaxed">{data.description}</p>
            </div>

            {/* Attractions Section */}
            {data.attractions && data.attractions.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-primaryText mb-6">Top Attractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.attractions.map((attraction, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start">
                        <div className="bg-primary bg-opacity-10 rounded-full p-2 mr-3">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-primaryText">{attraction.name}</h3>
                          <p className="text-sm text-secondaryText capitalize">{attraction.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            {/* Weather Card */}
            {data.weather && (
              <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl shadow-md p-8 text-white mb-8">
                <h2 className="text-2xl font-bold mb-4">Current Weather</h2>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-5xl font-bold">{data.weather.temperature}°C</p>
                    <p className="text-lg capitalize mt-2">{data.weather.condition}</p>
                  </div>
                  {data.weather.icon && (
                    <img 
                      src={`https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`}
                      alt={data.weather.condition}
                      className="w-20 h-20"
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span>Humidity: {data.weather.humidity}%</span>
                </div>
              </div>
            )}

            {/* Plan Trip CTA */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-primaryText mb-4">Ready to Visit?</h3>
              <p className="text-secondaryText mb-6">Start planning your trip to {data.name} today!</p>
              <Link 
                to="/plan-trip"
                state={{ destination: data.name }}
                className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Plan Your Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetails;
