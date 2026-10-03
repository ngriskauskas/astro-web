import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { useAuth } from "../../contexts/AuthContext";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import type { AspectPoint } from "../../types/aspect";
import type { DailyTimingsType } from "../../types/timings";

const NO_TIMINGS: DailyTimingsType = { aspects: [], angleTimings: [] };

export const useDailyTimings = () => {
  const {
    settings: { profileId },
    type,
  } = useWheel();
  const { user } = useAuth();
  const {
    settings: { aspectOptions },
  } = useChartSettings();

  const [timings, setTimings] = useState<DailyTimingsType>(NO_TIMINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || (type !== "time" && type !== "transit")) return;
    if (type === "transit" && profileId === undefined) {
      setTimings(NO_TIMINGS);
      return;
    }

    // Set when a newer request replaces this one, so a late answer is ignored.
    let cancelled = false;
    const fetchTimings = async () => {
      setLoading(true);
      setError(false);
      try {
        const res: DailyTimingsType =
          type === "time"
            ? await apiFetch("/timing/daily", {
                method: "POST",
                body: JSON.stringify({ date: getLocalISODate() }),
              })
            : await apiFetch("/timing/daily-transit", {
                method: "POST",
                body: JSON.stringify({ date: getLocalISODate(), birthProfileId: profileId }),
              });
        if (cancelled) return;
        setTimings({
          ...res,
          aspects: res.aspects.filter(
            ({ aspect }) =>
              aspect.type === "CONJUNCTION" &&
              (isAscendant(aspect.point1) || isAscendant(aspect.point2)),
          ),
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch daily timings", err);
        setTimings(NO_TIMINGS);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimings();
    return () => {
      cancelled = true;
    };
  }, [aspectOptions, profileId, user, type]);

  return { timings, loading, error };
};

const isAscendant = (point: AspectPoint) => point.type === "Angle" && point.value.name === "ASC";
