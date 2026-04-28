import { useCallback, useEffect, useState } from "react";

const cacheKey = "tripwise-offline-advanced-planner";

export const useOfflineTripCache = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedAt, setCachedAt] = useState(null);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCachedAt(JSON.parse(cached).cachedAt || null);
      } catch {
        setCachedAt(null);
      }
    }

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  const saveOffline = useCallback((payload) => {
    const nextCache = {
      cachedAt: new Date().toISOString(),
      payload
    };
    localStorage.setItem(cacheKey, JSON.stringify(nextCache));
    setCachedAt(nextCache.cachedAt);
    return nextCache;
  }, []);

  const loadOffline = useCallback(() => {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    return JSON.parse(cached).payload;
  }, []);

  const clearOffline = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setCachedAt(null);
  }, []);

  return {
    isOnline,
    cachedAt,
    saveOffline,
    loadOffline,
    clearOffline
  };
};
