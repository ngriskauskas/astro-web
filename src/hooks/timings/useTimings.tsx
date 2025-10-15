import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import type { PlanetBase, PlanetName } from "../../types/planet";
import type { AspectType } from "../../types/aspect";
import type { ZodiacSign } from "../../types/zodiac";
import { useAuth } from "../../contexts/AuthContext";

type ExactDateRange = [string, string];

export interface AspectTiming {
  planet1: PlanetBase;
  planet2: PlanetBase;
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

export interface TimingEvent {
  date: string;
  event: "start" | "end" | "exact";
  type: "aspect" | "ingress" | "retrograde";
  data: AspectTiming | RetrogradeTiming | IngressTiming;
}

export const useCurrentTimings = () => {
  const {
    settings: { zodiacSystem, ayanamsa, profileId },
    type,
  } = useWheel();

  const { user } = useAuth();

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
            timezone: user?.timezone,
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
    const fetchTransitTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/transit", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            birth_profile_id: profileId,
            timezone: user?.timezone,
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
    if (!user) return;
    if (type === "time") fetchTimings();
    else if (type === "transit") fetchTransitTimings();
  }, [zodiacSystem, ayanamsa, profileId, user]);

  return { timings, loading };
};

export const convertToEvents = ({
  aspects = [],
  ingresses = [],
  retrogrades = [],
}: CurrentTimingsType) => {
  const aspectEvents: TimingEvent[] = aspects.flatMap((a) => [
    { date: a.start_date, event: "start", data: a, type: "aspect" },
    { date: a.end_date, event: "end", data: a, type: "aspect" },
    ...a.exact_date_ranges.map(([start]) => ({
      date: start,
      event: "exact",
      data: a,
      type: "aspect",
    })),
  ]) as TimingEvent[];

  const ingressEvents: TimingEvent[] = ingresses.map((i) => ({
    date: i.date,
    event: "exact",
    data: i,
    type: "ingress",
  }));

  const retrogradeEvents: TimingEvent[] = retrogrades.flatMap((r) => [
    { date: r.start_date, event: "start", data: r, type: "retrograde" },
    { date: r.end_date, event: "end", data: r, type: "retrograde" },
  ]);

  const now = new Date();

  const ongoingAspects = aspects.filter(
    (a) => new Date(a.start_date) <= now && new Date(a.end_date) >= now,
  );

  const ongoingRetrogrades = retrogrades.filter(
    (r) => new Date(r.start_date) <= now && new Date(r.end_date) >= now,
  );
  return {
    ongoingAspects,
    ongoingRetrogrades,
    aspectEvents,
    ingressEvents,
    retrogradeEvents,
  };
};
