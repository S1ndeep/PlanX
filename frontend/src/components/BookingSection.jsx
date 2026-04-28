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
    href: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`
  },
  {
    title: "Flights",
    badge: "Air",
    partner: "Skyscanner",
    description: `Compare flight options and routes heading into ${destination}.`,
    href: `https://www.skyscanner.com/transport/flights-to/${encodeURIComponent(destination.toLowerCase())}`
  },
  {
    title: "Activities",
    badge: "Explore",
    partner: "GetYourGuide",
    description: `Find tours, experiences, and guided activities around ${destination}.`,
    href: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`
  },
  {
    title: "Car Rentals",
    badge: "Drive",
    partner: "Discover Cars",
    description: `Check rental car options so you can move through ${destination} at your own pace.`,
    href: `https://www.discovercars.com/?a_aid=tripwise&search=${encodeURIComponent(destination)}`
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
    <section className="w-full rounded-3xl bg-white/80 shadow-xl px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <div className="w-full flex flex-col items-center">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#147ea2]">Destination</label>
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#53d6f7] text-xl pointer-events-none">🔍</span>
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search any city..."
              className="w-full rounded-xl border border-[#53d6f7]/30 bg-white/90 pl-11 pr-4 py-3 text-lg text-[#0f172a] outline-none shadow focus:border-[#53d6f7] transition placeholder:text-[#53d6f7]/60"
              ref={suggestionsRef}
            />
            {shouldShowSuggestions && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#53d6f7]/30 bg-white/95 shadow-lg z-10 absolute left-0 right-0">
                {filteredDestinations.map((destination) => (
                  <button
                    key={destination}
                    type="button"
                    onClick={() => handleDestinationSelect(destination)}
                    className={`block w-full border-b border-[#53d6f7]/10 px-4 py-2 text-left text-base transition last:border-b-0 ${
                      destination === selectedDestination
                        ? "bg-[#53d6f7]/80 text-[#0f172a] font-bold"
                        : "text-[#147ea2] hover:bg-[#e0f7fa]"
                    }`}
                  >
                    {destination}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 inline-flex rounded-full border border-[#53d6f7]/30 bg-[#e0f7fa]/80 px-6 py-3 text-base text-[#147ea2] shadow-md">
          {destinationHighlights[selectedDestination] || `Travel booking links for ${selectedDestination}.`}
        </div>
      </div>
      <div className="w-full grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fadeInSlow">
        {bookingOptions.map((option) => (
          <BookingCard key={option.title} {...option} />
        ))}
      </div>
    </section>
  );
};

export default BookingSection;
