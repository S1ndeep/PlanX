import { useEffect, useMemo, useRef, useState } from "react";
import BookingCard from "./BookingCard.jsx";

const destinationHighlights = {
  Goa: "Beach stays, easy flights, and coastal experiences.",
  Jaipur: "Heritage hotels, palace tours, and city transfers.",
  Manali: "Mountain stays, activity bookings, and scenic drives.",
  Udaipur: "Lakefront hotels, romantic stays, and guided culture.",
  Rishikesh: "River retreats, wellness stays, and outdoor adventures.",
  Mumbai: "City hotels, direct flights, and urban experiences."
};

const buildBookingOptions = (destination) => [
  {
    title: "Hotels",
    badge: "Stay",
    partner: "Booking.com",
    description: `Browse hotel stays and resort options in ${destination}.`,
    href: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
    priceRange: "₹4,500 - ₹12,000",
    rating: "4.5",
    distance: "1.8 km from itinerary",
    recommendation: "Recommended for your plan"
  },
  {
    title: "Flights",
    badge: "Air",
    partner: "Skyscanner",
    description: `Compare flight options and routes heading into ${destination}.`,
    href: `https://www.skyscanner.com/transport/flights-to/${encodeURIComponent(destination.toLowerCase())}`,
    priceRange: "₹5,800 - ₹14,500",
    rating: "Best fare window",
    distance: "Strong route coverage",
    recommendation: "Best deals"
  },
  {
    title: "Activities",
    badge: "Explore",
    partner: "GetYourGuide",
    description: `Find tours, experiences, and guided activities around ${destination}.`,
    href: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`,
    priceRange: "₹900 - ₹4,500",
    rating: "4.7",
    distance: "Matched to itinerary themes",
    recommendation: "Recommended for your plan"
  },
  {
    title: "Car Rentals",
    badge: "Drive",
    partner: "Discover Cars",
    description: `Check rental car options so you can move through ${destination} at your own pace.`,
    href: `https://www.discovercars.com/?a_aid=tripwise&search=${encodeURIComponent(destination)}`,
    priceRange: "₹2,200 - ₹6,500",
    rating: "Flexible",
    distance: "Useful for spread-out stops",
    recommendation: "Trip flexibility"
  }
];

const BookingSection = ({ destinations = [] }) => {
  const initialDestination = destinations[0] || "Goa";
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const [searchValue, setSearchValue] = useState(initialDestination);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setSelectedDestination(initialDestination);
    setSearchValue(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredDestinations = useMemo(() => {
    const trimmedQuery = searchValue.trim().toLowerCase();

    if (!trimmedQuery) {
      return [];
    }

    return destinations
      .filter((destination) => destination.toLowerCase().includes(trimmedQuery))
      .slice(0, 10);
  }, [destinations, searchValue]);

  const bookingOptions = useMemo(
    () => buildBookingOptions(selectedDestination),
    [selectedDestination]
  );

  const shouldShowSuggestions =
    showSuggestions &&
    searchValue.trim().length > 0 &&
    searchValue.trim().toLowerCase() !== selectedDestination.trim().toLowerCase() &&
    filteredDestinations.length > 0;

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setSearchValue(destination);
    setShowSuggestions(false);
  };

  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[rgba(10,25,35,0.9)] px-6 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-[18px] sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,169,255,0.16),transparent_35%),linear-gradient(135deg,rgba(10,25,35,0.28),rgba(6,18,24,0.18))]" />
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8edcff]">
            Conversion Hub
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#f5fbff] sm:text-4xl">
            Book smarter around your itinerary
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b8d3dc]">
            Personalized booking options based on your itinerary. Move from planning into real reservations for stays, routes, experiences, and flexible transport.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-[#8edcff]/25 bg-[rgba(30,200,165,0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8edcff]">
              Destination Focus
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-[#d6eaf2] backdrop-blur-md">
              {selectedDestination}
            </span>
          </div>
          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-[rgba(8,30,38,0.48)] px-4 py-2 text-sm text-[#d6eaf2] backdrop-blur-md">
            {destinationHighlights[selectedDestination] || `Travel booking links for ${selectedDestination}.`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(7,31,39,0.58)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8faab5]">
              Best for
            </p>
            <p className="mt-3 text-lg font-semibold text-[#f5fbff]">{selectedDestination}</p>
            <p className="mt-2 text-sm leading-7 text-[#b8d3dc]">
              Build bookings around the same destination you are planning inside TripWise.
            </p>
          </div>

          <div ref={suggestionsRef}>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#8faab5]">
              Destination
            </label>
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search any city..."
              className="w-full rounded-[22px] border border-white/15 bg-[rgba(255,255,255,0.05)] px-5 py-4 text-base text-[#eaf6f9] outline-none backdrop-blur-md transition placeholder:text-[#6f8e99] focus:border-[#2DA9FF] focus:shadow-[0_0_0_2px_rgba(45,169,255,0.2)]"
            />

            {shouldShowSuggestions && (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-[22px] border border-white/12 bg-[rgba(7,31,39,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                {filteredDestinations.map((destination) => (
                  <button
                    key={destination}
                    type="button"
                    onClick={() => handleDestinationSelect(destination)}
                    className={`block w-full border-b border-white/10 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                      destination === selectedDestination
                        ? "bg-[rgba(45,169,255,0.18)] text-[#f5fbff]"
                        : "text-[#d6eaf2] hover:bg-white/10"
                    }`}
                  >
                    {destination}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {bookingOptions.map((option) => (
          <BookingCard key={option.title} {...option} />
        ))}
      </div>
    </section>
  );
};

export default BookingSection;
