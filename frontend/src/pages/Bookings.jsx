
const Bookings = () => {
  const destinationOptions = Array.from(
    new Set(indiaDestinations.map((destination) => destination.city.trim()).filter(Boolean))
  ).sort((firstCity, secondCity) => firstCity.localeCompare(secondCity));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] flex flex-col">
      <header className="w-full flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#0f172a] text-center mb-4 drop-shadow-lg">Book Your Trip</h1>
        <p className="text-lg sm:text-xl text-[#147ea2] text-center max-w-2xl mb-8">Hotels, flights, activities, and car rentals—curated for your destination. Move from itinerary planning into real-world bookings with TripWise.</p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <div className="w-full max-w-6xl px-2 sm:px-6">
          <BookingSection destinations={destinationOptions} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
