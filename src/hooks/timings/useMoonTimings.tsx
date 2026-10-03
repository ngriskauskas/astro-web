import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { useAuth } from "../../contexts/AuthContext";
import type { MoonTimingsType } from "../../types/moon";

export const useMoonTimings = () => {
  const { user } = useAuth();
  const [timings, setTimings] = useState<MoonTimingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchMoonTimings = async () => {
      setError(false);
      try {
        const res: MoonTimingsType = await apiFetch("/timing/current-moon", {
          method: "POST",
          body: JSON.stringify({ date: getLocalISODate() }),
        });
        if (!cancelled) setTimings(res);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch moon timings", err);
        setTimings(null);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMoonTimings();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { timings, loading, error };
};
