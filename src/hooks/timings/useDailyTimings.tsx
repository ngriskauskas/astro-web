import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import type { PlanetName } from "../../types/planet";
import type { AspectType } from "../../types/aspect";
import type { ZodiacSign } from "../../types/zodiac";
import { useAuth } from "../../contexts/AuthContext";
import type { KeyType } from "../../types/cusp";

export interface AspectTiming {
  angle_type: KeyType;
  planet: PlanetName;
  start_time: string;
  end_time: string;
  sign: ZodiacSign;
  aspect_type: AspectType;
}

export interface KeyAngleTiming {
  angle_type: KeyType;
  sign: ZodiacSign;
  start_time: string;
  end_time: string;
}

export interface DailyTimingsType {
  daily_aspects: AspectTiming[];
  key_angles: KeyAngleTiming[];
}

export const useDailyTimings = () => {
  const {
    settings: { zodiacSystem, ayanamsa, profileId, houseSystem },
    type,
  } = useWheel();
  const { user } = useAuth();

  const [timings, setTimings] = useState<DailyTimingsType>({
    daily_aspects: [],
    key_angles: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDailyTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/daily", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            zodiac_system: zodiacSystem,
            ayanamsa: zodiacSystem === "tropical" ? null : ayanamsa,
            house_system: houseSystem,
          }),
        });
        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch daily timings", err);
        setTimings({ daily_aspects: [], key_angles: [] });
      } finally {
        setLoading(false);
      }
    };
    const fetchTransitTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/daily-transit", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            birth_profile_id: profileId,
            zodiac_system: zodiacSystem,
            ayanamsa: zodiacSystem === "tropical" ? null : ayanamsa,
            house_system: houseSystem,
          }),
        });
        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch daily timings", err);
        setTimings({ daily_aspects: [], key_angles: [] });
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;
    if (type === "time") fetchDailyTimings();
    else if (type === "transit") fetchTransitTimings();
    fetchDailyTimings();
  }, [zodiacSystem, ayanamsa, profileId, houseSystem, user]);

  return { timings, loading };
};
