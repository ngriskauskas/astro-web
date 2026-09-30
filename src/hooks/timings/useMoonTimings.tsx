import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { useAuth } from "../../contexts/AuthContext";
import type { MoonTimingsType } from "../../types/moon";

export const useMoonTimings = () => {
  const { user } = useAuth();
  const [timings, setTimings] = useState<MoonTimingsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMoonTimings = async () => {
      try {
        const res: MoonTimingsType = await apiFetch("/timing/current-moon", {
          method: "POST",
          body: JSON.stringify({ date: getLocalISODate() }),
        });
        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch moon timings", err);
        setTimings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMoonTimings();
  }, [user]);

  return { timings, loading };
};
