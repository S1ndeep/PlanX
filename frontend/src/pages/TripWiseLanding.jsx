import React from "react";

const bgImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80";
const tours = [
  {
    title: "Himalayan Adventure",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7fda0c?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Lakeside Retreat",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Forest Escape",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Waterfall Wonders",
    img: "https://images.unsplash.com/photo-1444065381814-865dc9f9e736?auto=format&fit=crop&w=600&q=80",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1465101046530-73398c7fda0c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1444065381814-865dc9f9e736?auto=format&fit=crop&w=400&q=80",
];

const TripWiseLanding = () => (
  <div className="bg-[#0b0f13] text-white min-h-screen font-[Montserrat]">
    {/* Navigation Bar */}
    <nav className="fixed w-full z-10 bg-transparent backdrop-blur-md flex items-center justify-between px-8 py-4">
      <h2 className="text-2xl font-bold text-[#00e5ff]">TripWise</h2>
      <ul className="flex gap-6 text-lg">
        <li>Home</li>
        <li>Destinations</li>
        <li>Planner</li>
        <li>Tours</li>
        <li>Gallery</li>
        <li>Reviews</li>
        <li>Contact</li>
      </ul>
    </nav>

    {/* Hero Section with Video Background */}
    <section className="hero relative h-screen w-full overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="bg-video absolute w-full h-full object-cover top-0 left-0"
      >
        <source src="/videos/travel.mp4" type="video/mp4" />
        {/* Fallback text if video not supported */}
        Your browser does not support the video tag.
      </video>
      {/* Overlay gradient */}
      <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10" />
      <div className="hero-content relative z-20 w-full flex flex-col items-center justify-center pt-32">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-[#00e5ff] drop-shadow-lg animate-fade-in">Time to Travel with TripWise</h1>
        <p className="text-xl md:text-2xl mb-8 animate-fade-in">Discover the world with smart AI travel planning</p>
        <button className="bg-[#00e5ff] text-black font-bold px-8 py-3 rounded-full text-xl shadow-lg hover:bg-[#00bcd4] transition animate-fade-in">Plan Your Trip</button>
      </div>
    </section>

    {/* Popular Tours Section */}
    <section className="py-16 px-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-10 text-center text-[#00e5ff]">Popular Tours</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tours.map((tour, idx) => (
          <div
            key={idx}
            className="card bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition group"
          >
            <img src={tour.img} alt={tour.title} className="w-full h-48 object-cover group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold mt-4 mb-2 px-4">{tour.title}</h3>
          </div>
        ))}
      </div>
    </section>

    {/* Discover Section */}
    <section className="py-16 px-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#00e5ff]">Discover the World in a New Way</h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full h-64 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
            <button className="bg-[#00e5ff] text-black rounded-full p-6 text-3xl font-bold shadow-lg hover:bg-[#00bcd4] transition">▶</button>
          </div>
        </div>
        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
          {gallery.map((img, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg group">
              <img src={img} alt="Travel highlight" className="w-full h-32 object-cover group-hover:scale-110 transition" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-[#00e5ff] text-2xl">▶</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#0b0f13] py-8 text-center border-t border-[#00e5ff]">
      <p className="mb-4">© TripWise</p>
      <div className="flex justify-center gap-6 text-[#00e5ff] text-xl">
        <span>Instagram</span>
        <span>Facebook</span>
        <span>Twitter</span>
      </div>
    </footer>
  </div>
);

export default TripWiseLanding;
