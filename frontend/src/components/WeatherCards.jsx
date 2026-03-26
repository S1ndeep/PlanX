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
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,30,38,0.78)_0%,rgba(14,47,58,0.72)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-[26px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Weather by Day</h2>
          <p className="mt-2 text-sm text-slate-300">
            Forecast for {city || "your destination"} from Open-Meteo.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {forecast.map((day, index) => (
          <div
            key={`${day.date}-${index}`}
            className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#147ea2]">
                  Day {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{city}</p>
                <p className="mt-1 text-xs text-slate-400">{day.date}</p>
              </div>
              <div className="rounded-full border border-[#8edcff]/25 bg-[#0b3b43]/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8edcff] backdrop-blur-md">
                {weatherIcons[day.icon] || "Weather"}
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-sm text-slate-300">{day.condition}</p>
              <p className="text-base font-semibold text-white">
                {day.temperatureMax}C / {day.temperatureMin}C
              </p>
            </div>
          </div>
        ))}

        {forecast.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/6 px-4 py-8 text-center text-sm text-slate-400 backdrop-blur-md">
            Weather forecast will appear once destination coordinates are available.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCards;
