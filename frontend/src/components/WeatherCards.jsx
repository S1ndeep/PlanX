const weatherIcons = {
  sunny: "Sun",
  "partly-cloudy": "Cloud",
  cloudy: "Overcast",
  rain: "Rain",
  drizzle: "Drizzle",
  fog: "Fog",
  snow: "Snow",
  storm: "Storm"
};

const WeatherCards = ({ forecast = [], city = "" }) => {
  return (
    <div className="rounded-[28px] border border-white/45 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Weather by Day</h2>
          <p className="mt-2 text-sm text-slate-500">
            Forecast for {city || "your destination"} from Open-Meteo.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {forecast.map((day, index) => (
          <div
            key={`${day.date}-${index}`}
            className="rounded-[20px] border border-white/55 bg-[rgba(255,255,255,0.88)] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#147ea2]">
                  Day {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{city}</p>
                <p className="mt-1 text-xs text-slate-500">{day.date}</p>
              </div>
              <div className="rounded-full border border-sky-200/70 bg-[rgba(236,251,255,0.92)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                {weatherIcons[day.icon] || "Weather"}
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-sm text-slate-600">{day.condition}</p>
              <p className="text-base font-semibold text-slate-900">
                {day.temperatureMax}C / {day.temperatureMin}C
              </p>
            </div>
          </div>
        ))}

        {forecast.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-white/60 bg-[rgba(255,255,255,0.84)] px-4 py-8 text-center text-sm text-slate-500">
            Weather forecast will appear once destination coordinates are available.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCards;
