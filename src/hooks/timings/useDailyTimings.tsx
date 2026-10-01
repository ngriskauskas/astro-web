import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import { useAuth } from "../../contexts/AuthContext";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import type { AspectPoint } from "../../types/aspect";
import type { DailyTimingsType } from "../../types/timings";

export const useDailyTimings = () => {
  const {
    settings: { profileId },
    type,
  } = useWheel();
  const { user } = useAuth();
  const {
    settings: { aspectOptions },
  } = useChartSettings();

  const [timings, setTimings] = useState<DailyTimingsType>({
    aspects: [],
    angleTimings: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDailyTimings = async () => {
      setLoading(true);
      try {
        const res: DailyTimingsType = await apiFetch("/timing/daily", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
          }),
        });
        setTimings({
          ...res,
          aspects: res.aspects.filter(
            ({ aspect }) =>
              aspect.type === "CONJUNCTION" &&
              (isAscendant(aspect.point1) || isAscendant(aspect.point2)),
          ),
        });
      } catch (err) {
        console.error("Failed to fetch daily timings", err);
        setTimings({ aspects: [], angleTimings: [] });
      } finally {
        setLoading(false);
      }
    };
    const fetchDailyTransitTimings = async () => {
      if (profileId === undefined) {
        setTimings({ aspects: [], angleTimings: [] });
        return;
      }

      setLoading(true);
      try {
        const res: DailyTimingsType = await apiFetch("/timing/daily-transit", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            birthProfileId: profileId,
          }),
        });
        setTimings({
          ...res,
          aspects: res.aspects.filter(
            ({ aspect }) =>
              aspect.type === "CONJUNCTION" &&
              (isAscendant(aspect.point1) || isAscendant(aspect.point2)),
          ),
        });
      } catch (err) {
        console.error("Failed to fetch daily transit timings", err);
        setTimings({ aspects: [], angleTimings: [] });
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;
    if (type === "time") fetchDailyTimings();
    else if (type === "transit") fetchDailyTransitTimings();
  }, [aspectOptions, profileId, user, type]);

  return { timings, loading };
};

const isAscendant = (point: AspectPoint) => point.type === "Angle" && point.value.name === "ASC";
