import { useState, useEffect } from "react";
import { useWheel } from "../useWheel";
import { apiFetch } from "../../utils/api";
import { getLocalISODateTime } from "../../utils/funcs";
import { useAuth } from "../../contexts/AuthContext";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import type { CurrentTimingsType, TimingEvent, TransitTimingsType } from "../../types/timings";

export const useCurrentTimings = ({
  filterKeyAngleAspects = false,
}: { filterKeyAngleAspects?: boolean } = {}) => {
  const {
    type,
    settings: { profileId },
  } = useWheel();

  const { user } = useAuth();
  const {
    settings: { aspectOptions },
  } = useChartSettings();

  const [timings, setTimings] = useState<CurrentTimingsType | TransitTimingsType>({
    retrogrades: [],
    ingresses: [],
    aspects: [],
    stations: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || (type !== "time" && type !== "transit")) return;
    if (type === "transit" && profileId === undefined) return;

    // Set when a newer request replaces this one, so a late answer is ignored.
    let cancelled = false;
    const fetchTimings = async () => {
      setLoading(true);
      setError(false);
      try {
        const res: CurrentTimingsType | TransitTimingsType =
          type === "time"
            ? await apiFetch("/timing/current", {
                method: "POST",
                body: JSON.stringify({ dateTime: getLocalISODateTime() }),
              })
            : await apiFetch("/timing/transit", {
                method: "POST",
                body: JSON.stringify({
                  dateTime: getLocalISODateTime(),
                  birthProfileId: profileId,
                }),
              });
        if (!cancelled) setTimings(filterWeeklyAspects(res, filterKeyAngleAspects));
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch timings", err);
        setTimings(
          type === "time"
            ? { retrogrades: [], ingresses: [], aspects: [], stations: [] }
            : { aspects: [] },
        );
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimings();
    return () => {
      cancelled = true;
    };
  }, [aspectOptions, filterKeyAngleAspects, profileId, user, type]);

  return { timings, loading, error };
};

const filterWeeklyAspects = <T extends CurrentTimingsType | TransitTimingsType>(
  timings: T,
  enabled: boolean,
): T => {
  if (!enabled) return timings;

  return {
    ...timings,
    aspects: timings.aspects.filter(({ aspect }) =>
      [aspect.point1, aspect.point2].every(
        (point) =>
          point.type !== "Angle" || point.value.name === "ASC" || point.value.name === "MC",
      ),
    ),
  };
};

export const convertToEvents = (timings: CurrentTimingsType | TransitTimingsType) => {
  const aspects = timings.aspects;
  const ingresses = "ingresses" in timings ? timings.ingresses : [];
  const retrogrades = "retrogrades" in timings ? timings.retrogrades : [];
  const stations = "stations" in timings ? timings.stations : [];

  const aspectEvents: Extract<TimingEvent, { type: "aspect" }>[] = aspects.flatMap(
    (aspect): Extract<TimingEvent, { type: "aspect" }>[] => [
      {
        date: aspect.startAspect.dateTime,
        event: "start",
        data: aspect,
        type: "aspect",
      },
      {
        date: aspect.endAspect.dateTime,
        event: "end",
        data: aspect,
        type: "aspect",
      },
      ...aspect.exactDateRanges.map(
        ({ dateTime }): Extract<TimingEvent, { type: "aspect" }> => ({
          date: dateTime,
          event: "exact",
          data: aspect,
          type: "aspect",
        }),
      ),
    ],
  );

  const ingressEvents: Extract<TimingEvent, { type: "ingress" }>[] = ingresses.map((i) => ({
    date: i.endPlanet.dateTime,
    event: "exact",
    data: i,
    type: "ingress",
  }));

  const retrogradeEvents: Extract<TimingEvent, { type: "retrograde" }>[] = retrogrades.flatMap(
    (r): Extract<TimingEvent, { type: "retrograde" }>[] => [
      {
        date: r.startPlanet.dateTime,
        event: "start",
        data: r,
        type: "retrograde",
      },
      {
        date: r.endPlanet.dateTime,
        event: "end",
        data: r,
        type: "retrograde",
      },
    ],
  );

  const stationEvents: Extract<TimingEvent, { type: "station" }>[] = stations.map((station) => ({
    date: station.exactStationPlanet.dateTime,
    event: "exact",
    data: station,
    type: "station",
  }));

  const now = new Date();

  const ongoingAspects = aspects.filter(
    (aspect) =>
      new Date(aspect.startAspect.dateTime) <= now && new Date(aspect.endAspect.dateTime) >= now,
  );

  const ongoingRetrogrades = retrogrades.filter(
    (retrograde) =>
      new Date(retrograde.startPlanet.dateTime) <= now &&
      new Date(retrograde.endPlanet.dateTime) >= now,
  );
  return {
    ongoingAspects,
    ongoingRetrogrades,
    aspectEvents,
    ingressEvents,
    retrogradeEvents,
    stationEvents,
  };
};
