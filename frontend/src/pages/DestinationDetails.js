import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const pageBackgroundImage =
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1800&q=80";

const fallbackHero =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";

const toUnsplashFallback = (placeName) =>
  `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(placeName)}`;

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
        console.error("Error fetching destination details:", err);
        setError("Failed to load destination details. Please try again later.");
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
      <div className="planx-page">
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-[#147ea2]" />
            <p className="text-lg text-slate-600">Loading destination details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="planx-page">
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="planx-panel mx-auto max-w-md rounded-[32px] px-6 py-8 text-center">
            <p className="mb-4 text-lg text-red-200">{error || "Destination not found"}</p>
            <Link
              to="/explore"
              className="planx-button px-6 py-3 text-sm"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="planx-page">
      <div className="planx-page-content">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/explore"
            className="planx-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Explore
          </Link>

          <div className="planx-panel mt-8 overflow-hidden rounded-[40px]">
            <div className="relative h-[280px] sm:h-[340px] lg:h-[380px]">
              <img
                src={data.image || fallbackHero}
                alt={data.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = fallbackHero;
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,16,26,0.18)_0%,rgba(3,16,26,0.52)_72%,rgba(3,16,26,0.76)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 lg:p-12">
                <p className="planx-kicker border-none bg-white/78">
                  Destination Guide
                </p>
                <h1 className="mt-4 max-w-3xl font-[var(--font-editorial)] text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  {data.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">
                  Explore the essentials, weather snapshot, and top places before turning this destination into a full TripWise route.
                </p>
              </div>
            </div>

            <div className="px-8 py-12 sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="animate-[fadeUp_900ms_ease-out]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                  About This Stop
                </p>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  A curated overview for planning smarter.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                  Review the city summary, explore standout places, and check current conditions before moving into itinerary building.
                </p>
              </div>

              <div className="grid gap-4 lg:justify-items-end">
                {[
                  {
                    title: "Live travel snapshot",
                    description: `See top attractions, weather, and planning shortcuts for ${data.name}.`
                  },
                  {
                    title: "Plan-ready destination",
                    description: "Jump straight into TripWise Planner with this city already in mind."
                  },
                  {
                    title: "Inspiration first",
                    description: "Use this page to explore, then save the city into a multi-day itinerary."
                  }
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className={`max-w-sm rounded-[28px] border border-[#15283d]/10 bg-[linear-gradient(180deg,#17304a_0%,#264968_100%)] p-5 text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] animate-[fadeUp_1000ms_ease-out] ${
                      index === 0 ? "lg:mr-0" : index === 1 ? "lg:mr-10" : "lg:mr-4"
                    }`}
                  >
                    <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.7fr_0.8fr]">
              <div className="space-y-8">
                <section className="rounded-[34px] border border-white/25 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
                  <h2 className="text-3xl font-semibold text-slate-950">About {data.name}</h2>
                  <p className="mt-5 text-base leading-9 text-slate-600">{data.description}</p>
                </section>

                {data.attractions && data.attractions.length > 0 && (
                  <section className="rounded-[34px] border border-white/25 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                          Explore Highlights
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-slate-950">Top Attractions</h2>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {data.attractions.map((attraction, index) => (
                        <article
                          key={`${attraction.name}-${index}`}
                          className="overflow-hidden rounded-[30px] border border-white/50 bg-[rgba(255,255,255,0.7)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
                        >
                          <div className="relative h-52 overflow-hidden bg-slate-200">
                            <img
                              src={attraction.image || toUnsplashFallback(attraction.name)}
                              alt={attraction.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.src = toUnsplashFallback(attraction.name);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                            {attraction.rating && attraction.rating !== "N/A" && (
                              <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                                Rating {attraction.rating}
                              </div>
                            )}
                            {attraction.category && (
                              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold capitalize text-slate-900 shadow-sm">
                                {attraction.category}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 p-5">
                            <h3 className="text-xl font-semibold leading-7 text-slate-900">{attraction.name}</h3>
                            {attraction.address && (
                              <p className="text-sm leading-6 text-slate-500">{attraction.address}</p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {data.videos && data.videos.length > 0 && (
                  <section className="rounded-[34px] border border-white/25 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                        Watch Before You Go
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-950">Travel Videos</h2>
                    </div>
                    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {data.videos.map((video, index) => (
                        <article
                          key={`${video.videoId}-${index}`}
                          className="overflow-hidden rounded-[28px] border border-white/50 bg-[rgba(255,255,255,0.7)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-md"
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title={video.title}
                            allowFullScreen
                            className="h-56 w-full"
                            loading="lazy"
                          />
                          <div className="p-4">
                            <h3 className="text-sm font-semibold leading-6 text-slate-900">{video.title}</h3>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-8">
                {data.weather && (
                  <section className="rounded-[34px] border border-white/20 bg-[rgba(16,53,61,0.72)] p-8 text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] backdrop-blur-[24px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Weather Snapshot
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold">Current Weather</h2>
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-5xl font-semibold">{data.weather.temperature}C</p>
                        <p className="mt-3 text-lg capitalize text-slate-200">{data.weather.condition}</p>
                      </div>
                      {data.weather.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`}
                          alt={data.weather.condition}
                          className="h-20 w-20"
                        />
                      )}
                    </div>
                    <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                      Humidity: {data.weather.humidity}%
                    </div>
                  </section>
                )}

                <section className="rounded-[34px] border border-white/25 bg-[rgba(255,255,255,0.58)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[24px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#147ea2]">
                    Next Step
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-slate-950">Ready to Visit?</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Start planning your trip to {data.name} today with the same editor used across TripWise.
                  </p>
                  <Link
                    to="/plan-trip"
                    state={{ destination: data.name }}
                    className="planx-button mt-8 inline-flex w-full px-6 py-4 text-base"
                  >
                    Plan Your Trip
                  </Link>
                </section>
              </div>
            </div>
          </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DestinationDetails;
