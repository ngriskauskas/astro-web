import { Fragment, useEffect, useRef } from "react";
import { useDesc } from "../../contexts/DescContext";
import { convertToEvents } from "../../hooks/timings/useTimings";
import { AspectData, type Aspect } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { PlanetsData, type PlanetName } from "../../types/planet";
import type { CurrentTimingsType, TimingEvent, TransitTimingsType } from "../../types/timings";
import { ZodiacData } from "../../types/zodiac";
import { Spinner } from "../utils/Spinner";
import { LoadError } from "../utils/LoadError";
import { StationPreview } from "../descriptions/StationTimingPanel";

const WEEKDAY_RULERS: readonly PlanetName[] = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
];
const HOURS_PER_DAY = 432;
const TRACK_HEIGHT = HOURS_PER_DAY * 7;
const DAY_HOURS = [0, 6, 12, 18];
const EVENT_CARD_HEIGHT = 28;
const EVENT_MARKER_GAP = 36;
const MARKER_HALF_HEIGHT = EVENT_CARD_HEIGHT / 2;

interface DayBlock {
  date: Date;
  start: Date;
  end: Date;
  ruler: PlanetName;
  index: number;
}

interface DatedTimingEvent {
  event: TimingEvent;
  date: Date;
}

interface PositionedTimingEvent extends DatedTimingEvent {
  dayIndex: number;
  exactOffset: number;
  displayOffset: number;
  index: number;
}

interface WeeklyPlanetaryTimelineProps {
  embedded?: boolean;
  loading: boolean;
  error?: boolean;
  timings: CurrentTimingsType | TransitTimingsType;
}

export const WeeklyPlanetaryTimeline = ({
  embedded = false,
  loading,
  error = false,
  timings,
}: WeeklyPlanetaryTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const days: DayBlock[] = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() + index);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      date: start,
      start,
      end,
      ruler: WEEKDAY_RULERS[index],
      index,
    };
  });
  const weekEnd = days[days.length - 1].end;
  const { aspectEvents, ingressEvents, retrogradeEvents, stationEvents } = convertToEvents(timings);
  const events: DatedTimingEvent[] = [
    ...aspectEvents,
    ...ingressEvents,
    ...retrogradeEvents,
    ...stationEvents,
  ]
    .map((event) => ({ event, date: new Date(event.date) }))
    .filter(({ date }) => date >= weekStart && date < weekEnd)
    .sort((left, right) => left.date.getTime() - right.date.getTime());
  const positionedEvents = days.flatMap((day) =>
    positionDayEvents(
      day,
      events.filter(({ date }) => isSameLocalDate(date, day.date)),
    ),
  );

  const foundNowDayIndex = days.findIndex((day) => now >= day.start && now < day.end);
  const nowDayIndex = foundNowDayIndex < 0 ? 0 : foundNowDayIndex;
  const nowDay = days[nowDayIndex];
  const nowPosition =
    nowDayIndex * HOURS_PER_DAY +
    ((now.getTime() - nowDay.start.getTime()) / (nowDay.end.getTime() - nowDay.start.getTime())) *
      HOURS_PER_DAY;

  // Bring the current time into view once, when the timeline first appears. Doing it
  // again as the time moves on would undo the user's own scrolling.
  const ready = !loading && !error;
  useEffect(() => {
    if (!ready || !scrollRef.current) return;
    scrollRef.current.scrollTop = nowPosition - scrollRef.current.clientHeight / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (loading) return <Spinner />;
  if (error) return <LoadError message="Could not load this week's timings." />;

  return (
    <div className={embedded ? "" : "border-t border-gray-200 py-5"}>
      {!embedded && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Planetary Week Timeline</h2>
          <p className="text-sm text-gray-500">Events positioned at their exact local times</p>
        </div>
      )}
      <div
        ref={scrollRef}
        className="max-h-[460px] overflow-y-auto border-y border-gray-200"
      >
        <div
          className="relative grid grid-cols-[3rem_4.5rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_6.5rem_minmax(0,1fr)]"
          style={{ height: TRACK_HEIGHT }}
        >
          <div className="relative text-[10px] text-gray-500">
            {days.flatMap((day) =>
              DAY_HOURS.map((hour) => {
                const top = day.index * HOURS_PER_DAY + (hour / 24) * HOURS_PER_DAY;
                const isFirst = day.index === 0 && hour === 0;
                return (
                  <span
                    key={`${day.index}-${hour}`}
                    className={`absolute right-1 whitespace-nowrap tabular-nums ${isFirst ? "translate-y-0" : "-translate-y-1/2"}`}
                    style={{ top: isFirst ? "0.25rem" : `${(top / TRACK_HEIGHT) * 100}%` }}
                  >
                    {formatHour(hour)}
                  </span>
                );
              }),
            )}
            <span
              className="absolute right-1 -translate-y-full whitespace-nowrap text-[9px] tabular-nums"
              style={{ top: "calc(100% - 0.25rem)" }}
            >
              12 AM
            </span>
          </div>

          <div className="relative border-x border-gray-200">
            {days.map((day) => {
              const ruler = PlanetsData[day.ruler];
              return (
                <div
                  key={day.date.toISOString()}
                  className="absolute inset-x-0 flex flex-col items-center justify-center gap-1 border-b border-white px-1 text-center"
                  style={{
                    top: `${(day.index / 7) * 100}%`,
                    height: `${100 / 7}%`,
                    backgroundColor: `${ruler.color}20`,
                  }}
                >
                  <span className="text-lg" style={{ color: ruler.color }} aria-hidden="true">
                    {ruler.glyph}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-800">
                    {day.date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <span className="text-[9px] text-gray-500">
                    {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[9px] text-gray-500">{ruler.displayName} day</span>
                </div>
              );
            })}
          </div>

          <div className="relative min-w-0">
            <div className="absolute inset-y-0 left-3 border-l border-dashed border-gray-300" />
            {positionedEvents.map((positionedEvent) => {
              const { event, date, dayIndex, exactOffset, displayOffset, index } = positionedEvent;
              const exactPosition = dayIndex * HOURS_PER_DAY + exactOffset;
              const displayPosition = dayIndex * HOURS_PER_DAY + displayOffset;
              const exactTop = `${(exactPosition / TRACK_HEIGHT) * 100}%`;
              const displayTop = `${(displayPosition / TRACK_HEIGHT) * 100}%`;
              const connectorTop = Math.min(exactPosition, displayPosition);
              const connectorHeight = Math.abs(displayPosition - exactPosition);

              return (
                <Fragment key={`${event.type}-${event.date}-${index}`}>
                  {connectorHeight > 1 && (
                    <span
                      className="absolute left-8 z-0 w-px bg-rose-200"
                      style={{
                        top: `${(connectorTop / TRACK_HEIGHT) * 100}%`,
                        height: `${(connectorHeight / TRACK_HEIGHT) * 100}%`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className="absolute left-3 z-10 h-px w-5 bg-rose-400"
                    style={{ top: exactTop }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute left-8 right-1 z-10 -translate-y-1/2"
                    style={{ top: displayTop }}
                  >
                    <TimingEventPreview event={event} date={date} />
                  </div>
                </Fragment>
              );
            })}
            {events.length === 0 && (
              <p className="absolute left-6 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                No timing events this week
              </p>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 z-20"
            style={{ top: `${(nowPosition / TRACK_HEIGHT) * 100}%` }}
            aria-label="Current time"
          >
            <div className="border-t-2 border-rose-500" />
            <span className="absolute left-1 top-0 -translate-y-1/2 rounded-sm bg-rose-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
              NOW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const positionDayEvents = (day: DayBlock, events: DatedTimingEvent[]): PositionedTimingEvent[] => {
  const sortedEvents = [...events].sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  );
  if (sortedEvents.length === 0) return [];

  const minimumCenter = MARKER_HALF_HEIGHT;
  const maximumCenter = HOURS_PER_DAY - MARKER_HALF_HEIGHT;
  const gap = Math.min(
    EVENT_MARKER_GAP,
    (maximumCenter - minimumCenter) / Math.max(1, sortedEvents.length - 1),
  );
  const exactOffsets = sortedEvents.map(
    ({ date }) =>
      ((date.getTime() - day.start.getTime()) / (day.end.getTime() - day.start.getTime())) *
      HOURS_PER_DAY,
  );
  const displayOffsets = exactOffsets.map((offset) =>
    Math.max(minimumCenter, Math.min(maximumCenter, offset)),
  );

  for (let index = 1; index < displayOffsets.length; index++) {
    displayOffsets[index] = Math.max(displayOffsets[index], displayOffsets[index - 1] + gap);
  }
  displayOffsets[displayOffsets.length - 1] = Math.min(
    displayOffsets[displayOffsets.length - 1],
    maximumCenter,
  );
  for (let index = displayOffsets.length - 2; index >= 0; index--) {
    displayOffsets[index] = Math.min(displayOffsets[index], displayOffsets[index + 1] - gap);
  }

  return sortedEvents.map(({ event, date }, index) => ({
    event,
    date,
    dayIndex: day.index,
    exactOffset: exactOffsets[index],
    displayOffset: displayOffsets[index],
    index,
  }));
};

const TimingEventPreview = ({ event, date }: { event: TimingEvent; date: Date }) => {
  const { open } = useDesc();
  const className =
    "inline-flex h-7 w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 overflow-hidden whitespace-nowrap rounded-sm border border-gray-200 bg-white px-1 text-[9px] shadow-sm transition hover:border-rose-400 hover:shadow";
  const time = formatTime(date);

  switch (event.type) {
    case "aspect": {
      const aspect = getEventAspect(event);
      const point1 = formatAspectPoint(aspect.point1);
      const point2 = formatAspectPoint(aspect.point2);
      const action = event.event === "start" ? "starts" : event.event === "end" ? "ends" : "exact";
      return (
        <button
          type="button"
          className={className}
          title={`${point1} ${AspectData[aspect.type].name} ${point2} ${action} at ${time}`}
          aria-label={`${point1} ${AspectData[aspect.type].name} ${point2} ${action} at ${time}`}
          onClick={() => open({ type: "aspectTiming", value: event })}
        >
          <span className="shrink-0 tabular-nums text-gray-500">{time}</span>
          <AspectPointMarker point={aspect.point1} />
          <span className="shrink-0 font-semibold">{AspectData[aspect.type].glyph}</span>
          <AspectPointMarker point={aspect.point2} />
          <span className="truncate text-gray-500">{action}</span>
        </button>
      );
    }
    case "ingress": {
      const planet = event.data.planet;
      const sign = event.data.endPlanet.planet.sign;
      return (
        <button
          type="button"
          className={className}
          title={`${PlanetsData[planet.name].displayName} enters ${ZodiacData[sign].displayName} at ${time}`}
          aria-label={`${PlanetsData[planet.name].displayName} enters ${ZodiacData[sign].displayName} at ${time}`}
          onClick={() => open({ type: "ingressTiming", value: event })}
        >
          <span className="shrink-0 tabular-nums text-gray-500">{time}</span>
          <span className="shrink-0 text-sm">{PlanetsData[planet.name].glyph}</span>
          <span aria-hidden="true">→</span>
          <img src={ZodiacData[sign].glyph} alt="" className="h-4 w-4 shrink-0" />
        </button>
      );
    }
    case "retrograde": {
      const planet = event.data.planet;
      const action = event.event === "start" ? "starts" : "ends";
      return (
        <button
          type="button"
          className={className}
          title={`${PlanetsData[planet.name].displayName} ${action} retrograde at ${time}`}
          aria-label={`${PlanetsData[planet.name].displayName} ${action} retrograde at ${time}`}
          onClick={() => open({ type: "retrogradeTiming", value: event })}
        >
          <span className="shrink-0 tabular-nums text-gray-500">{time}</span>
          <span className="shrink-0 text-sm">{PlanetsData[planet.name].glyph}</span>
          <span className="font-semibold">℞</span>
          <span className="truncate text-gray-500">{action}</span>
        </button>
      );
    }
    case "station":
      return <StationPreview station={event} />;
  }
};

const AspectPointMarker = ({ point }: { point: Aspect["point1"] }) =>
  point.type === "Planet" ? (
    <span className="shrink-0 text-sm">{PlanetsData[point.value.name].glyph}</span>
  ) : (
    <span className="shrink-0 text-[9px] font-semibold">{AngleData[point.value.name].name}</span>
  );

const formatAspectPoint = (point: Aspect["point1"]) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;

const getEventAspect = (event: Extract<TimingEvent, { type: "aspect" }>) => {
  if (event.event === "start") return event.data.startAspect.aspect;
  if (event.event === "end") return event.data.endAspect.aspect;
  return (
    event.data.exactDateRanges.find(({ dateTime }) => dateTime === event.date)?.aspect ??
    event.data.aspect
  );
};

const formatHour = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const isSameLocalDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();
