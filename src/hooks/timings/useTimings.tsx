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
    const fetchTransitTimings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/timing/transit", {
          method: "POST",
          body: JSON.stringify({
            date: getLocalISODate(),
            birth_profile_id: profileId,
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
    if (type === "time") fetchTimings();
    else if (type === "transit") fetchTransitTimings();
  }, [zodiacSystem, ayanamsa, profileId]);

  return { timings, loading };
};

const isToday = (d: string | Date) => {
  const today = new Date(getLocalISODate());
  const date = new Date(d);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const convertToEvents = ({
  aspects,
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

  const allEvents: TimingEvent[] = [
    ...aspectEvents,
    ...ingressEvents,
    ...retrogradeEvents,
  ];

  const today = new Date(getLocalISODate());
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const oneWeekAhead = new Date(today);
  oneWeekAhead.setDate(today.getDate() + 7);

  const pastEvents = allEvents
    .filter((e) => {
      const d = new Date(e.date);
      return d >= oneWeekAgo && d < today;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const todayEvents = allEvents.filter((e) => isToday(e.date));

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tomorrowEvents = allEvents.filter((e) => {
    const d = new Date(e.date);
    return d.toDateString() === tomorrow.toDateString();
  });
  const upcomingEvents = allEvents
    .filter((e) => {
      const d = new Date(e.date);
      return d > tomorrow && d <= oneWeekAhead;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { todayEvents, tomorrowEvents, pastEvents, upcomingEvents };
};
