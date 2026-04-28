const OfflinePanel = ({ t, offline, onSave, onLoad, onClear }) => {
  return (
    <section className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("offline")}</h2>
          <p className="mt-2 text-sm text-white/65">
            Status: {offline.isOnline ? "Online" : "Offline"} · Cached: {offline.cachedAt ? new Date(offline.cachedAt).toLocaleString() : "None"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onSave} className="rounded-lg bg-[#4dd4ff] px-5 py-3 text-sm font-bold text-slate-950">
            {t("saveOffline")}
          </button>
          <button type="button" onClick={onLoad} className="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white">
            {t("loadOffline")}
          </button>
          <button type="button" onClick={onClear} className="rounded-lg border border-red-300/30 px-5 py-3 text-sm font-bold text-red-100">
            {t("clearOffline")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default OfflinePanel;
