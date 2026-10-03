import { convertToEvents } from "../../hooks/timings/useTimings";
import { PlanetsData, type PlanetName } from "../../types/planet";
import type { CurrentTimingsType, TimingEvent, TransitTimingsType } from "../../types/timings";
import { AspectPreview } from "../descriptions/AspectTimingPanel";
import { IngressPreview } from "../descriptions/IngressPanel";
import { RetrogradePreview } from "../descriptions/RetrogradeTimingPanel";
import { StationPreview } from "../descriptions/StationTimingPanel";
import { Spinner } from "../utils/Spinner";
import { LoadError } from "../utils/LoadError";

const WEEKDAY_RULERS: readonly PlanetName[] = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
];

interface WeeklyPlanetaryTimingsProps {
  embedded?: boolean;
  loading: boolean;
  error?: boolean;
  timings: CurrentTimingsType | TransitTimingsType;
}

export const WeeklyPlanetaryTimings = ({
  embedded = false,
  loading,
  error = false,
  timings,
}: WeeklyPlanetaryTimingsProps) => {
  if (loading) return <Spinner />;
  if (error) return <LoadError message="Could not load this week's timings." />;

  const { aspectEvents, ingressEvents, retrogradeEvents, stationEvents } = convertToEvents(timings);
  const events: TimingEvent[] = [
    ...aspectEvents,
    ...ingressEvents,
    ...retrogradeEvents,
    ...stationEvents,
  ].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      date,
      ruler: WEEKDAY_RULERS[index],
      events: events.filter((event) => isSameLocalDate(new Date(event.date), date)),
    };
  });

  return (
    <div className={embedded ? "" : "border-t border-gray-200 py-5"}>
      {!embedded && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Planetary Days</h2>
          <p className="text-sm text-gray-500">
            This week&apos;s timing events, grouped by weekday ruler
          </p>
        </div>
      )}
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {days.map(({ date, ruler, events: dayEvents }) => {
          const planetInfo = PlanetsData[ruler];
          return (
            <div
              key={date.toISOString()}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3"
            >
              <div className="flex items-start gap-2 border-r border-gray-100 pr-2 sm:pr-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg"
                  style={{
                    color: planetInfo.color,
                    borderColor: `${planetInfo.color}66`,
                    backgroundColor: `${planetInfo.color}16`,
                  }}
                  aria-hidden="true"
                >
                  {planetInfo.glyph}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-800">
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-gray-500">
                    {planetInfo.displayName} day
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap content-start items-start gap-2">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event, eventIndex) => (
                    <div key={`${event.type}-${event.date}-${eventIndex}`} className="max-w-full">
                      <TimingEventPreview event={event} />
                    </div>
                  ))
                ) : (
                  <span className="py-1 text-xs text-gray-400">No timing events</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimingEventPreview = ({ event }: { event: TimingEvent }) => {
  switch (event.type) {
    case "aspect":
      return <AspectPreview aspect={event} />;
    case "ingress":
      return <IngressPreview ingress={event} />;
    case "retrograde":
      return <RetrogradePreview retrograde={event} />;
    case "station":
      return <StationPreview station={event} />;
  }
};

const isSameLocalDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();
