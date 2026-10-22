import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { getLocalISODateTime } from "../utils/funcs";
import { useAuth } from "./AuthContext";
import { PlanetaryHoursContext, type PlanetaryHoursStatus } from "../hooks/usePlanetaryHours";
import type { PlanetaryHoursType } from "../types/planetaryHours";

const UNAVAILABLE = "PlanetaryHoursUnavailable";

export const PlanetaryHoursProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PlanetaryHoursStatus>("loading");
  const [data, setData] = useState<PlanetaryHoursType | null>(null);
  const [now, setNow] = useState(() => new Date());
  // A page can host this for all of its widgets; the request is made only if one reads it.
  const [wanted, setWanted] = useState(false);
  const request = useCallback(() => setWanted(true), []);
  const date = getLocalISODateTime(now).slice(0, 10);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !wanted) return;

    // Set when a newer request replaces this one, so a late answer is ignored.
    let cancelled = false;
    const fetchHours = async () => {
      setStatus("loading");
      try {
        const res: PlanetaryHoursType = await apiFetch("/timing/planetary-hours", {
          method: "POST",
          body: JSON.stringify({ date }),
        });
        if (cancelled) return;
        setData(res);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setData(null);
        if (err instanceof Error && err.message === UNAVAILABLE) {
          setStatus("unavailable");
        } else {
          console.error("Failed to fetch planetary hours", err);
          setStatus("error");
        }
      }
    };

    fetchHours();
    return () => {
      cancelled = true;
    };
  }, [user, date, wanted]);

  return (
    <PlanetaryHoursContext.Provider value={{ status, data, now, request }}>
      {children}
    </PlanetaryHoursContext.Provider>
  );
};
