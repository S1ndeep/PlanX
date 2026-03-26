import BookingSection from "../components/BookingSection.jsx";
import Footer from "../components/Footer.jsx";
import indiaDestinations from "../data/indiaDestinations.js";

const bookingHighlights = [
  {
    title: "Best-match stays",
    description: "Shortlist hotel partners around your route, vibe, and budget range."
  },
  {
    title: "Route intelligence",
    description: "Compare flight windows and timing signals before you lock the trip."
  },
  {
    title: "Bookable experiences",
    description: "Turn your itinerary into tours, tickets, and memorable local add-ons."
  }
];

const Bookings = () => {
  const destinationOptions = Array.from(
    new Set(indiaDestinations.map((destination) => destination.city.trim()).filter(Boolean))
  ).sort((firstCity, secondCity) => firstCity.localeCompare(secondCity));

  return (
    <div className="planx-page">
      <div className="planx-page-content">
        <div className="mx-auto max-w-7xl">
          <div className="planx-panel rounded-[40px] px-8 py-12 sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="animate-[fadeUp_900ms_ease-out]">
                <p className="planx-kicker">
                  Bookings
                </p>
                <h1 className="planx-heading mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Convert your trip plan into confident bookings.
                </h1>
                <p className="planx-subtle mt-5 max-w-2xl text-base leading-8">
                  Use TripWise like a smart booking concierge. Explore high-fit stays, flights, activities, and rental options shaped around the same destination you are already planning.
                </p>
              </div>

              <div className="grid gap-4 lg:justify-items-end">
                {bookingHighlights.map((option, index) => (
                  <div
                    key={option.title}
                    className={`max-w-sm rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,40,50,0.88)_0%,rgba(10,25,35,0.96)_100%)] p-5 text-white shadow-[0_24px_80px_rgba(3,18,24,0.28)] backdrop-blur-xl animate-[fadeUp_1000ms_ease-out] ${
                      index === 0 ? "lg:mr-0" : index === 1 ? "lg:mr-10" : "lg:mr-4"
                    }`}
                  >
                    <h2 className="text-xl font-semibold text-[#f5fbff]">{option.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#b8d3dc]">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 animate-[fadeUp_1100ms_ease-out]">
              <BookingSection destinations={destinationOptions} />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Bookings;
