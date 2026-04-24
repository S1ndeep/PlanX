import BookingSection from "../components/BookingSection.jsx";
import Footer from "../components/Footer.jsx";
import indiaDestinations from "../data/indiaDestinations.js";

const bookingHighlights = [
  {
    title: "Hotel partners",
    description: "Jump into destination-based hotel searches with fast booking links."
  },
  {
    title: "Flight planning",
    description: "Compare route options once your city is locked in for a trip."
  },
  {
    title: "Activity add-ons",
    description: "Move from planning into tours, tickets, and bookable experiences."
  }
];

const Bookings = () => {
  const destinationOptions = Array.from(
    new Set(indiaDestinations.map((destination) => destination.city.trim()).filter(Boolean))
  ).sort((firstCity, secondCity) => firstCity.localeCompare(secondCity));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#062f35] text-white">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
        alt="Turquoise ocean and bright shoreline"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.26)_0%,rgba(4,24,31,0.42)_30%,rgba(4,24,31,0.68)_64%,rgba(4,24,31,0.84)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.14),transparent_30%)]" />

      <div className="relative z-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[40px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="animate-[fadeUp_900ms_ease-out]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                  Bookings
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Move from itinerary planning into real-world bookings.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                  Use TripWise to shape the route, then open hotel, flight, activity, and rental partners built around your chosen destination.
                </p>
              </div>

              <div className="grid gap-4 lg:justify-items-end">
                {bookingHighlights.map((option, index) => (
                  <div
                    key={option.title}
                    className={`max-w-sm rounded-[28px] border border-white/10 bg-[#10353d]/65 p-5 text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] backdrop-blur-md animate-[fadeUp_1000ms_ease-out] ${
                      index === 0 ? "lg:mr-0" : index === 1 ? "lg:mr-10" : "lg:mr-4"
                    }`}
                  >
                    <h2 className="text-xl font-semibold text-white">{option.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{option.description}</p>
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
