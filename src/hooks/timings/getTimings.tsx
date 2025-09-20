import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import type { PlanetName } from "../../types/planet";
import type { AspectType } from "../../types/aspect";
import type { ZodiacSign } from "../../types/zodiac";

type ExactDateRange = [string, string];

export interface AspectTiming {
  planet1: PlanetName;
  planet2: PlanetName;
  start_date: string;
  end_date: string;
  aspect_type: AspectType;
  exact_date_ranges: ExactDateRange[];
}

export interface RetrogradeTiming {
  planet: PlanetName;
  start_date: string;
  end_date: string;
}

export interface IngressTiming {
  planet: PlanetName;
  sign: ZodiacSign;
  date: string;
}

export interface CurrentTimingsType {
  retrogrades: RetrogradeTiming[];
  ingresses: IngressTiming[];
  aspects: AspectTiming[];
}

export const useCurrentTimings = () => {
  const {
    settings: { zodiacSystem, ayanamsa },
  } = useWheel();

  const [timings, setTimings] = useState<CurrentTimingsType>({
    retrogrades: [],
    ingresses: [],
    aspects: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/current", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            zodiac_system: zodiacSystem,
            ayanamsa: zodiacSystem === "tropical" ? null : ayanamsa,
          }),
        });

        setTimings(res);
      } catch (err) {
        console.error("Failed to fetch timings", err);
        setTimings({ retrogrades: [], ingresses: [], aspects: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, [zodiacSystem, ayanamsa]);

  return { timings, loading };
};
