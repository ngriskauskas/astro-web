import { useState, type ReactNode } from "react";
import {
  convertToEvents,
  useCurrentTimings,
  type AspectTiming,
  type IngressTiming,
  type RetrogradeTiming,
} from "../../hooks/timings/useTimings";
import { AspectTimingCard } from "./timings/AspectTimingCard";
import { IngressTimingCard } from "./timings/IngressTimingCard";
import { RetrogradeTimingCard } from "./timings/RetrogradeTimingCard";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export interface TimingEvent {
  date: string;
  event: "start" | "end" | "exact";
  type: "aspect" | "ingress" | "retrograde";
  data: AspectTiming | RetrogradeTiming | IngressTiming;
}

export const CurrentTimings = () => {
  const { loading, timings } = useCurrentTimings();

  if (loading) return <div>Loading...</div>;

  const { todayEvents, upcomingEvents, pastEvents, tomorrowEvents } =
    convertToEvents(timings);

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
