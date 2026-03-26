import Footer from "../components/Footer.jsx";

const supportOptions = [
  {
    title: "Live support",
    description: "Chat with our team for help with routes, saved trips, or itinerary editing."
  },
  {
    title: "Trip planning help",
    description: "Get guidance on destinations, travel timing, and building the perfect flow."
  },
  {
    title: "Account assistance",
    description: "Need help with login, saved trips, or sharing links? We are here for that too."
  }
];

const faqItems = [
  {
    question: "How do I save a trip?",
    answer: "Create your itinerary, then use the Save Trip button in the planner workspace."
  },
  {
    question: "Why is my travel route not showing?",
    answer: "Make sure both selected places have valid coordinates before adding them to Travel Legs."
  },
  {
    question: "Can I share my itinerary?",
    answer: "Yes. Saved trips generate a shareable link that others can open directly."
  }
];

const Support = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#062f35] text-white">
      <img
        src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80"
        alt="Aerial tropical shoreline with forest and turquoise water"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,31,0.28)_0%,rgba(4,24,31,0.42)_32%,rgba(4,24,31,0.68)_66%,rgba(4,24,31,0.84)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(7,190,210,0.14),transparent_30%)]" />

      <div className="relative z-10 px-6 pb-16 pt-28 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[40px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="animate-[fadeUp_900ms_ease-out]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8edcff]">
                  Support
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  We&apos;re online and ready to help you plan better trips.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                  Reach out for itinerary help, route issues, account questions, or anything else
                  you need while using TripWise.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  <div className="rounded-[30px] border border-white/10 bg-[#0a4952]/72 p-7 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Contact
                    </p>
                    <div className="mt-5 space-y-4 text-sm text-slate-200">
                      <p>Email: support@tripwise.com</p>
                      <p>Phone: +91 98765 43210</p>
                      <p>Hours: Mon - Sat, 9:00 AM to 7:00 PM</p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-[#0a4952]/72 p-7 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Quick help
                    </p>
                    <div className="mt-5 space-y-4 text-sm text-slate-200">
                      <p>Saved trips and share links</p>
                      <p>Travel Legs and route preview issues</p>
                      <p>Account login and trip recovery support</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:justify-items-end">
                {supportOptions.map((option, index) => (
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

            <div className="mt-12 rounded-[34px] border border-[#4dd4ff]/20 bg-[#0a4952]/72 p-8 shadow-[0_28px_90px_rgba(3,18,24,0.18)] backdrop-blur-md animate-[fadeUp_1100ms_ease-out]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                Frequently asked questions
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Support;
