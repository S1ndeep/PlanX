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

const helpCategories = [
  "Planning issues",
  "Account issues",
  "Booking help"
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
    <div className="planx-page">
      <div className="planx-page-content">
        <div className="mx-auto max-w-7xl">
          <div className="planx-panel rounded-[40px] px-8 py-12 sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="animate-[fadeUp_900ms_ease-out] text-slate-900">
                <p className="planx-kicker">
                  Support
                </p>
                <h1 className="planx-heading mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  We&apos;re online and ready to help you plan better trips.
                </h1>
                <p className="planx-subtle mt-5 max-w-2xl text-base leading-8">
                  Reach out for itinerary help, route issues, account questions, or anything else
                  you need while using TripWise.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  <div className="rounded-[30px] border border-[#8edcff]/30 bg-[#0b3b43]/90 p-7 text-white shadow-[0_20px_60px_rgba(3,18,24,0.16)] md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Live chat
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">Need fast help right now?</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
                      Start with live support for itinerary issues, AI planner questions, or route and save problems.
                    </p>
                  </div>

                  <div className="rounded-[30px] border border-[#15283d]/10 bg-white/70 p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Contact
                    </p>
                    <div className="mt-5 space-y-4 text-sm text-slate-600">
                      <p>Email: support@tripwise.com</p>
                      <p>Phone: +91 98765 43210</p>
                      <p>Hours: Mon - Sat, 9:00 AM to 7:00 PM</p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-[#15283d]/10 bg-white/70 p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                      Quick help
                    </p>
                    <div className="mt-5 space-y-4 text-sm text-slate-600">
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
                    className={`max-w-sm rounded-[28px] border border-[#15283d]/10 bg-[linear-gradient(180deg,#17304a_0%,#264968_100%)] p-5 text-white shadow-[0_24px_80px_rgba(3,18,24,0.18)] animate-[fadeUp_1000ms_ease-out] ${
                      index === 0 ? "lg:mr-0" : index === 1 ? "lg:mr-10" : "lg:mr-4"
                    }`}
                  >
                    <h2 className="text-xl font-semibold text-white">{option.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 rounded-[34px] border border-[#15283d]/10 bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_28px_90px_rgba(3,18,24,0.08)] animate-[fadeUp_1100ms_ease-out]">
              <div className="mb-8 flex flex-wrap gap-3">
                {helpCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/10 bg-[#0b3b43]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8edcff]"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <p className="planx-kicker">
                Frequently asked questions
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#15283d]/10 bg-white/78 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
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
