import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";

const formatDuration = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const emptyCenter = [20.5937, 78.9629];

const RoadTripPlanner = ({ t, form, setForm, plan, loading, error, onSubmit }) => {
  const geometry = plan?.routeVariants?.[0]?.geometry || [];
  const center = geometry[0] || emptyCenter;

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur"
      >
        <h2 className="text-2xl font-semibold text-white">{t("roadTrip")}</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-semibold text-white/80">
            {t("source")}
            <input
              className="mt-2 w-full rounded-lg border border-white/15 bg-white px-4 py-3 text-slate-950"
              value={form.sourceCity}
              onChange={(event) => setForm((current) => ({ ...current, sourceCity: event.target.value }))}
              placeholder="Mumbai"
            />
          </label>
          <label className="text-sm font-semibold text-white/80">
            {t("destination")}
            <input
              className="mt-2 w-full rounded-lg border border-white/15 bg-white px-4 py-3 text-slate-950"
              value={form.destinationCity}
              onChange={(event) => setForm((current) => ({ ...current, destinationCity: event.target.value }))}
              placeholder="Goa"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold text-white/80">
              {t("travelMode")}
              <select
                className="mt-2 w-full rounded-lg border border-white/15 bg-white px-4 py-3 text-slate-950"
                value={form.travelMode}
                onChange={(event) => setForm((current) => ({ ...current, travelMode: event.target.value }))}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-white/80">
              {t("budget")}
              <input
                className="mt-2 w-full rounded-lg border border-white/15 bg-white px-4 py-3 text-slate-950"
                type="number"
                min="0"
                value={form.budget}
                onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
              />
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>}
          <button
            className="rounded-lg bg-[#4dd4ff] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-950 transition hover:bg-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Planning..." : t("generate")}
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-h-[460px] overflow-hidden rounded-lg border border-white/15 bg-white/10">
          <MapContainer center={center} zoom={plan ? 6 : 5} className="h-[460px] w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geometry.length > 0 && <Polyline positions={geometry} color="#0ea5e9" weight={5} />}
            {plan?.stops?.map((stop, index) => (
              <CircleMarker
                key={`${stop.type}-${index}`}
                center={[stop.coordinates.latitude, stop.coordinates.longitude]}
                radius={8}
                pathOptions={{ color: stop.type === "fuel" ? "#22c55e" : stop.type === "restaurant" ? "#f97316" : "#a78bfa" }}
              >
                <Popup>
                  <strong>{stop.name}</strong>
                  <br />
                  {Math.round(stop.distanceFromStartKm)} km from start
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <aside className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Journey timeline</h3>
          {plan ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-white/55">Distance</p>
                  <p className="font-bold text-white">{plan.summary.distanceKm} km</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-white/55">Time</p>
                  <p className="font-bold text-white">{formatDuration(plan.summary.durationMinutes)}</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-white/55">Fuel</p>
                  <p className="font-bold text-white">₹{plan.summary.fuelCost}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {plan.timeline.map((item, index) => (
                  <div key={`${item.kind}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8edcff]">
                      {formatDuration(item.offsetMinutes)} · {Math.round(item.distanceFromStartKm)} km
                    </p>
                    <p className="mt-1 font-semibold text-white">{item.title}</p>
                    {item.description && <p className="text-sm text-white/65">{item.description}</p>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-white/65">
              Generate a road trip to see optimized variants, recommended fuel stops, restaurant breaks, scenic pauses,
              and a route map.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default RoadTripPlanner;
