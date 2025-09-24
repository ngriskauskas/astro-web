import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODate } from "../../utils/funcs";
import type { PlanetName } from "../../types/planet";
import type { AspectType } from "../../types/aspect";
import type { ZodiacSign } from "../../types/zodiac";
import { useAuth } from "../../contexts/AuthContext";

type ExactDateRange = [string, string];

export interface AspectTiming {
  planet1: PlanetName;
  planet2: PlanetName;
  start_date: string;
  end_date: string;
  aspect_type: AspectType;
  exact_date_ranges: ExactDateRange[];
}

export interface IngressTiming {
  sign: ZodiacSign;
  date: string;
}

export interface CurrentTimingsType {
  ingresses: IngressTiming[];
  //aspects: AspectTiming[];
}

export interface TimingEvent {
  date: string;
  event: "start" | "end" | "exact";
  type: "aspect" | "ingress" | "retrograde";
  data: AspectTiming | IngressTiming;
}

export const useMoonTimings = () => {
  const {
    settings: { zodiacSystem, ayanamsa, profileId },
    type,
  } = useWheel();

  const { user } = useAuth();

  const [timings, setTimings] = useState<CurrentTimingsType>({
    ingresses: [],
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
        setTimings({ ingresses: [] });
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
        setTimings({ ingresses: [] });
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

const isToday = (d: string | Date) => {
  const today = new Date(getLocalISODate());
  const date = new Date(d);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const convertToEvents = ({ ingresses = [] }: CurrentTimingsType) => {
  const ingressEvents: TimingEvent[] = ingresses.map((i) => ({
    date: i.date,
    event: "exact",
    data: i,
    type: "ingress",
  }));

  const allEvents: TimingEvent[] = [...ingressEvents];

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
