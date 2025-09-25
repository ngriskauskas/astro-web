import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import type { ZodiacSign } from "../../types/zodiac";
import { useAuth } from "../../contexts/AuthContext";
import type { MoonPhase, MoonPhaseDirection } from "../../types/moon";

export interface IngressTiming {
  sign: ZodiacSign;
  date: string;
}

export interface MoonPhaseTiming {
  date: string;
  sign: ZodiacSign;
  direction: MoonPhaseDirection;
  phase: MoonPhase;
}

export interface CurrentTimingsType {
  ingresses: IngressTiming[];
  phases: MoonPhaseTiming[];
}

export const useMoonTimings = () => {
  const {
    settings: { zodiacSystem, ayanamsa, profileId },
    type,
  } = useWheel();

  const { user } = useAuth();

  const [timings, setTimings] = useState<CurrentTimingsType>({
    ingresses: [],
    phases: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/current-moon", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            zodiac_system: zodiacSystem,
            ayanamsa: zodiacSystem === "tropical" ? null : ayanamsa,
            timezone: user?.timezone,
          }),
        });

        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch timings", err);
        setTimings({ ingresses: [], phases: [] });
      } finally {
        setLoading(false);
      }
    };
    const fetchTransitTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/current-moon", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            birth_profile_id: profileId,
            timezone: user?.timezone,
          }),
        });

        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch timings", err);
        setTimings({ ingresses: [], phases: [] });
      } finally {
        setLoading(false);
      }
    };
    if (!user) return;
    if (type === "time") fetchTimings();
    else if (type === "transit") fetchTransitTimings();
  }, [zodiacSystem, ayanamsa, profileId, user]);

  return { timings, loading };
};
