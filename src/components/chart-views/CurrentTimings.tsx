import { convertToEvents, useCurrentTimings } from "../../hooks/timings/useTimings";
import type { TimingEvent } from "../../types/timings";
import { WeeklyTimeline } from "../timeline/WeeklyTimeline";
import type { TimelineEvent } from "../timeline/types";
import { AspectPreview } from "../descriptions/AspectTimingPanel";
import { IngressPreview } from "../descriptions/IngressPanel";
import { RetrogradePreview } from "../descriptions/RetrogradeTimingPanel";
import { StationPreview } from "../descriptions/StationTimingPanel";

export const CurrentTimings = () => {
  const { loading, timings } = useCurrentTimings();

  if (loading) return <div>Loading...</div>;

  const { aspectEvents, ingressEvents, retrogradeEvents, stationEvents } = convertToEvents(timings);

  const aspectTimelineEvents = aspectsToEvents(aspectEvents);
  const ingressTimelineEvents = ingressesToEvents(ingressEvents);
  const retrogradeTimelineEvents = retrogradesToEvents(retrogradeEvents);
  const stationTimelineEvents = stationsToEvents(stationEvents);

  const allTimelineEvents: TimelineEvent[] = [
    ...aspectTimelineEvents,
    ...ingressTimelineEvents,
    ...retrogradeTimelineEvents,
    ...stationTimelineEvents,
  ];

  return (
    <div className="space-y-8 ml-4 pb-4">
      <WeeklyTimeline events={allTimelineEvents} />
    </div>
  );
};

const aspectsToEvents = (aspects: Extract<TimingEvent, { type: "aspect" }>[]): TimelineEvent[] =>
  aspects.map((a) => ({
    start: new Date(a.date),
    renderPreview: () => <AspectPreview aspect={a} />,
  }));

const ingressesToEvents = (
  ingresses: Extract<TimingEvent, { type: "ingress" }>[],
): TimelineEvent[] =>
  ingresses.map((i) => ({
    start: new Date(i.date),
    renderPreview: () => <IngressPreview ingress={i} />,
  }));

const retrogradesToEvents = (
  retrogrades: Extract<TimingEvent, { type: "retrograde" }>[],
): TimelineEvent[] =>
  retrogrades.map((r) => ({
    start: new Date(r.date),
    renderPreview: () => <RetrogradePreview retrograde={r} />,
  }));

const stationsToEvents = (stations: Extract<TimingEvent, { type: "station" }>[]): TimelineEvent[] =>
  stations.map((station) => ({
    start: new Date(station.date),
    renderPreview: () => <StationPreview station={station} />,
  }));
