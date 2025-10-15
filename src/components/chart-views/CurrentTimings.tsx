import {
  convertToEvents,
  useCurrentTimings,
  type IngressTiming,
  type TimingEvent,
} from "../../hooks/timings/useTimings";
import { AspectTimingCard } from "./timings/AspectTimingCard";
import { IngressTimingCard } from "./timings/IngressTimingCard";
import { RetrogradeTimingCard } from "./timings/RetrogradeTimingCard";
import { WeeklyTimeline } from "../timeline/WeeklyTimeline";
import type { TimelineEvent } from "../timeline/types";
import { AspectPreview } from "../descriptions/AspectTimingPanel";
import { IngressPreview } from "../descriptions/IngressPanel";
import { RetrogradePreview } from "../descriptions/RetrogradeTimingPanel";

export const CurrentTimings = () => {
  const { loading, timings } = useCurrentTimings();

  if (loading) return <div>Loading...</div>;

  const { aspectEvents, ingressEvents, retrogradeEvents } =
    convertToEvents(timings);

  const aspectTimelineEvents = aspectsToEvents(aspectEvents);
  const ingressTimelineEvents = ingressesToEvents(ingressEvents);
  const retrogradeTimelineEvents = retrogradesToEvents(retrogradeEvents);

  const allTimelineEvents: TimelineEvent[] = [
    ...aspectTimelineEvents,
    ...ingressTimelineEvents,
    ...retrogradeTimelineEvents,
  ];

  return (
    <div className="space-y-8 ml-4 pb-4">
      <WeeklyTimeline events={allTimelineEvents} />
    </div>
  );
};

export const EventCard = ({ event }: { event: TimingEvent }) => {
  return (
    <div className="h-auto self-start">
      {(() => {
        switch (event.type) {
          case "aspect":
            return <AspectTimingCard event={event} />;
          case "ingress":
            return <IngressTimingCard ingress={event.data as IngressTiming} />;
          case "retrograde":
            return <RetrogradeTimingCard event={event} />;
          default:
            return null;
        }
      })()}
    </div>
  );
};

const aspectsToEvents = (aspects: TimingEvent[]): TimelineEvent[] =>
  aspects.map((a) => ({
    start: new Date(a.date),
    renderPreview: () => <AspectPreview aspect={a} />,
  }));

const ingressesToEvents = (ingresses: TimingEvent[]): TimelineEvent[] =>
  ingresses.map((i) => ({
    start: new Date(i.date),
    renderPreview: () => <IngressPreview ingress={i} />,
  }));

const retrogradesToEvents = (retrogrades: TimingEvent[]): TimelineEvent[] =>
  retrogrades.map((r) => ({
    start: new Date(r.date),
    renderPreview: () => <RetrogradePreview retrograde={r} />,
  }));
