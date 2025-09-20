import { useState, type ReactNode } from "react";
import {
  useCurrentTimings,
  type AspectTiming,
  type IngressTiming,
  type RetrogradeTiming,
} from "../../hooks/timings/getTimings";
import { AspectTimingCard } from "./timings/AspectTimingCard";
import { IngressTimingCard } from "./timings/IngressTimingCard";
import { RetrogradeTimingCard } from "./timings/RetrogradeTimingCard";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getLocalISODate } from "../../utils/funcs";

export interface TimingEvent {
  date: string;
  event: "start" | "end" | "exact";
  type: "aspect" | "ingress" | "retrograde";
  data: AspectTiming | RetrogradeTiming | IngressTiming;
}

const isToday = (d: string | Date) => {
  const today = new Date(getLocalISODate());
  const date = new Date(d);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const CurrentTimings = () => {
  const {
    loading,
    timings: { aspects, ingresses, retrogrades },
  } = useCurrentTimings();

  if (loading) return <div>Loading...</div>;

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
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(today.getDate() - 365);
  const oneWeekAhead = new Date(today);
  oneWeekAhead.setDate(today.getDate() + 7);

  const pastEvents = allEvents
    .filter((e) => {
      const d = new Date(e.date);
      return d >= oneYearAgo && d < today;
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

  return (
    <div className="space-y-8 ml-4 pb-4">
      {todayEvents.length > 0 && (
        <CollapsibleSection title="Today" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayEvents.map((event, i) => (
              <EventCard event={event} key={i} />
            ))}
          </div>
        </CollapsibleSection>
      )}
      {tomorrowEvents.length > 0 && (
        <CollapsibleSection title="Tomorrow" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tomorrowEvents.map((event, i) => (
              <EventCard event={event} key={i} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {upcomingEvents.length > 0 && (
        <CollapsibleSection title="Upcoming" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event, i) => (
              <EventCard event={event} key={i} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {pastEvents.length > 0 && (
        <CollapsibleSection title="Past" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastEvents.map((event, i) => (
              <EventCard event={event} key={i} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

const EventCard = ({ event }: { event: TimingEvent }) => {
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
const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-4 rounded-lg">
      <button
        className="flex justify-between items-center w-full text-left py-2 px-3  hover:bg-gray-200 rounded-t-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-lg">{title}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </section>
  );
};
