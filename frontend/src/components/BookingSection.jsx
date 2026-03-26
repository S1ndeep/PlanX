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
    <section className="rounded-[42px] border border-white/30 bg-[rgba(255,255,255,0.14)] px-6 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8edcff]">
            Affiliate Booking
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Book Your Trip</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
            Open trusted travel partners for hotels, flights, activities, and car rentals based on your selected destination.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-white/20 bg-[rgba(8,30,38,0.34)] px-4 py-2 text-sm text-white/80 backdrop-blur-md">
            {destinationHighlights[selectedDestination] || `Travel booking links for ${selectedDestination}.`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[26px] border border-white/20 bg-[rgba(7,31,39,0.38)] p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              Best for
            </p>
            <p className="mt-3 text-lg font-semibold text-white">{selectedDestination}</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              Build bookings around the same destination you are planning inside TripWise.
            </p>
          </div>

          <div ref={suggestionsRef}>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              Destination
            </label>
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search any city..."
              className="w-full rounded-[22px] border border-white/25 bg-[rgba(7,31,39,0.56)] px-5 py-4 text-base text-white outline-none backdrop-blur-md transition placeholder:text-white/45 focus:border-[#53d6f7]"
            />

            {shouldShowSuggestions && (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-[22px] border border-white/20 bg-[rgba(7,31,39,0.94)] shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                {filteredDestinations.map((destination) => (
                  <button
                    key={destination}
                    type="button"
                    onClick={() => handleDestinationSelect(destination)}
                    className={`block w-full border-b border-white/10 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                      destination === selectedDestination
                        ? "bg-[#1d6ed1] text-white"
                        : "text-white/88 hover:bg-white/10"
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

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {bookingOptions.map((option) => (
          <BookingCard key={option.title} {...option} />
        ))}
      </div>
    </section>
  );
};

export default BookingSection;
