const AiPlannerPanel = ({ t, form, setForm, result, loading, error, onSubmit }) => {
  const toggleInterest = (interest) => {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest]
    }));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white">{t("aiPlanner")}</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-semibold text-white/80">
            {t("destination")}
            <input
              className="mt-2 w-full rounded-lg bg-white px-4 py-3 text-slate-950"
              value={form.destination}
              onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold text-white/80">
              {t("budget")}
              <input
                className="mt-2 w-full rounded-lg bg-white px-4 py-3 text-slate-950"
                type="number"
                min="0"
                value={form.budget}
                onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
              />
            </label>
            <label className="text-sm font-semibold text-white/80">
              {t("duration")}
              <input
                className="mt-2 w-full rounded-lg bg-white px-4 py-3 text-slate-950"
                type="number"
                min="1"
                max="14"
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">{t("interests")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["adventure", "food", "culture", "nature", "shopping", "nightlife"].map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                    form.interests.includes(interest)
                      ? "border-[#4dd4ff] bg-[#4dd4ff] text-slate-950"
                      : "border-white/15 bg-white/5 text-white"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>}
          <button className="rounded-lg bg-[#4dd4ff] px-5 py-3 font-bold text-slate-950" disabled={loading}>
            {loading ? "Generating..." : t("generate")}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
        <h3 className="text-xl font-semibold text-white">Day-wise JSON itinerary</h3>
        {result?.itinerary ? (
          <div className="mt-5 space-y-4">
            {result.itinerary.days?.map((day) => (
              <article key={day.day} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <h4 className="text-lg font-semibold text-white">Day {day.day}: {day.theme}</h4>
                  <span className="text-sm font-semibold text-[#8edcff]">₹{day.estimatedCost}</span>
                </div>
                <p className="mt-1 text-sm text-white/60">{day.weatherNote}</p>
                <div className="mt-3 grid gap-2">
                  {day.schedule?.map((slot, index) => (
                    <div key={`${slot.time}-${index}`} className="rounded-lg bg-white/5 px-3 py-2">
                      <p className="font-semibold text-white">{slot.time} · {slot.title}</p>
                      <p className="text-sm text-white/65">{slot.notes} · ₹{slot.cost}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-cyan-100">
              {JSON.stringify(result.itinerary, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="mt-4 text-white/65">Generate an itinerary to see AI structured JSON with weather and attraction context.</p>
        )}
      </div>
    </section>
  );
};

export default AiPlannerPanel;
