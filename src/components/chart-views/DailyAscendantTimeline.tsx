import { useEffect, useRef } from "react";
import { useDailyTimings } from "../../hooks/timings/useDailyTimings";
import { isMulti, useWheel } from "../../hooks/useWheel";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useDesc } from "../../contexts/DescContext";
import { usePlanetaryHours } from "../../hooks/usePlanetaryHours";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { ZodiacData, ZodiacSigns, type ZodiacSign } from "../../types/zodiac";
import type { AngleTiming, AspectTiming } from "../../types/timings";
import { PlanetsData } from "../../types/planet";
import { formatDegMin, formatTime } from "../../utils/funcs";
import { planetaryHourBlocks } from "../../utils/planetaryHours";
import { Spinner } from "../utils/Spinner";
import { LoadError } from "../utils/LoadError";

const TRACK_HEIGHT = 2160;

// Time labels, signs, (planetary hours,) conjunction markers.
const COLUMNS = "grid-cols-[3rem_4.5rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_6.5rem_minmax(0,1fr)]";
const COLUMNS_WITH_HOURS =
  "grid-cols-[3rem_4.5rem_2.25rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_6.5rem_3rem_minmax(0,1fr)]";

interface SignSegment {
  sign: ZodiacSign;
  start: number;
  end: number;
}

interface ConjunctionEvent {
  timing: AspectTiming;
  dateTime: string;
}

export const DailyAscendantTimeline = () => {
  const wheel = useWheel();
  const keyAngles = isMulti(wheel)
    ? (wheel as MultiWheelContextType).otherKeyAngles
    : (wheel as SingleWheelContextType).keyAngles;
  const { timings, loading, error } = useDailyTimings();
  const { open } = useDesc();
  const scrollRef = useRef<HTMLDivElement>(null);
  const planetaryHours = usePlanetaryHours();
  const { now } = planetaryHours;
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const dayDuration = dayEnd.getTime() - dayStart.getTime();
  const nowPosition = Math.max(
    0,
    Math.min(100, ((now.getTime() - dayStart.getTime()) / dayDuration) * 100),
  );

  const ascendant = keyAngles.find((angle) => angle.name === "ASC");
  const ascendantTransitions = timings.angleTimings
    .filter(({ angle }) => angle.name === "ASC")
    .map((timing) => ({ timing, time: new Date(timing.dateTime).getTime() }))
    .filter(({ time }) => time <= dayEnd.getTime())
    .sort((a, b) => a.time - b.time);
  const signSegments = ascendant
    ? buildSignSegments(ascendantTransitions, ascendant.sign, dayStart.getTime(), dayEnd.getTime())
    : [];
  const conjunctions = getConjunctionEvents(timings.aspects, dayStart.getTime(), dayEnd.getTime());
  // Planetary hours are an addition: without them the timeline is shown as it always was.
  const hourBlocks =
    planetaryHours.status === "ready" && planetaryHours.data
      ? planetaryHourBlocks(planetaryHours.data, dayStart.getTime(), dayEnd.getTime())
      : undefined;

  // Bring the current time into view once, when the timeline first appears. Doing it
  // again as the time moves on would undo the user's own scrolling.
  const ready = !loading && !error && ascendant !== undefined;
  useEffect(() => {
    if (!ready || !scrollRef.current) return;
    scrollRef.current.scrollTop =
      (nowPosition / 100) * TRACK_HEIGHT - scrollRef.current.clientHeight / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const heading = (
    <h2 id="ascendant-heading" className="mb-2 text-lg font-semibold text-gray-900">
      Ascendant Today
    </h2>
  );

  if (!ready) {
    return (
      <section aria-labelledby="ascendant-heading" className="w-full border-t border-gray-200 py-3">
        {heading}
        {error ? (
          <LoadError message="Could not load today's timings." />
        ) : wheel.status === "error" ? (
          <LoadError message="Could not load the chart." />
        ) : (
          <Spinner />
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="ascendant-heading" className="w-full border-t border-gray-200 py-3">
      {heading}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="text-[10px] font-semibold uppercase text-gray-500">ASC</span>
        <img src={ZodiacData[ascendant.sign].glyph} alt="" className="h-4 w-4" />
        <span className="font-medium">{ZodiacData[ascendant.sign].displayName}</span>
        <span className="text-gray-500">{formatDegMin(ascendant.position.degMin)}</span>
      </div>

      <div ref={scrollRef} className="max-h-[460px] overflow-y-auto border-y border-gray-200">
        <div
          className={`relative grid ${hourBlocks ? COLUMNS_WITH_HOURS : COLUMNS}`}
          style={{ height: TRACK_HEIGHT }}
        >
          <div className="relative text-[10px] text-gray-500">
            {signSegments.map((segment, index) => {
              const isFirst = index === 0;
              const top = isFirst
                ? "0.25rem"
                : `${((segment.start - dayStart.getTime()) / dayDuration) * 100}%`;
              return (
                <span
                  key={`ingress-${segment.start}`}
                  className={`absolute right-1 ${isFirst ? "translate-y-0" : "-translate-y-1/2"} whitespace-nowrap text-[9px] tabular-nums`}
                  style={{ top }}
                >
                  {formatTime(segment.start)}
                </span>
              );
            })}
            <span
              className="absolute right-1 -translate-y-full whitespace-nowrap text-[9px] tabular-nums"
              style={{ top: "calc(100% - 0.25rem)" }}
            >
              {formatTime(dayEnd.getTime())}
            </span>
          </div>

          <div className="relative border-x border-gray-200 bg-gray-50/70">
            {signSegments.map((segment) => {
              const signInfo = ZodiacData[segment.sign];
              const top = ((segment.start - dayStart.getTime()) / dayDuration) * 100;
              const height = ((segment.end - segment.start) / dayDuration) * 100;
              return (
                <div
                  key={`${segment.sign}-${segment.start}`}
                  className="absolute inset-x-0 flex flex-col items-center justify-center gap-1 overflow-hidden border-b border-white/80 px-1 text-center"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    backgroundColor: `${signInfo.color}24`,
                  }}
                  title={`${ZodiacData[segment.sign].displayName} from ${formatTime(segment.start)}`}
                >
                  <img src={signInfo.glyph} alt="" className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium leading-tight text-gray-700">
                    {ZodiacData[segment.sign].displayName}
                  </span>
                </div>
              );
            })}
          </div>

          {hourBlocks && (
            <div
              role="list"
              aria-label="Planetary hours"
              className="relative border-r border-gray-200"
            >
              {hourBlocks.map(({ hour, start, end, top, bottom }) => {
                const planet = PlanetsData[hour.ruler];
                const isDay = hour.period === "DAY";
                const name = `${planet.displayName} hour, ${hour.hour} of 24, ${isDay ? "day" : "night"}, ${formatTime(start)} to ${formatTime(end)}`;
                const isCurrent = top <= now.getTime() && now.getTime() < bottom;
                return (
                  <div
                    key={hour.dateTime}
                    role="listitem"
                    aria-label={name}
                    aria-current={isCurrent ? "time" : undefined}
                    title={name}
                    className={`absolute inset-x-0 flex flex-col items-center overflow-hidden border-t border-gray-400 ${
                      isDay ? "bg-amber-50" : "bg-slate-200/70"
                    }`}
                    style={{
                      top: `${((top - dayStart.getTime()) / dayDuration) * 100}%`,
                      height: `${((bottom - top) / dayDuration) * 100}%`,
                    }}
                  >
                    {/* The line at the top of a block is where its hour starts. An hour that
                        began before midnight has no line of its own on this day. */}
                    {top === start && (
                      <time
                        dateTime={hour.dateTime}
                        className="mt-0.5 whitespace-nowrap text-[7px] leading-none tabular-nums text-gray-600 sm:text-[8px]"
                      >
                        {formatTime(start)}
                      </time>
                    )}
                    {/* Hours 1 and 13 begin at sunrise and sunset. */}
                    {(hour.hour === 1 || hour.hour === 13) && (
                      <span className="mt-0.5 text-[7px] font-semibold uppercase leading-none text-gray-600 sm:text-[8px]">
                        {isDay ? "Sunrise" : "Sunset"}
                      </span>
                    )}
                    <span
                      className="flex min-h-0 flex-1 items-center text-base font-semibold leading-none text-gray-900"
                      aria-hidden="true"
                    >
                      {planet.glyph}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative min-w-0">
            <div className="absolute inset-y-0 left-3 border-l border-dashed border-gray-300" />
            {conjunctions.map(({ timing, dateTime }) => {
              const top = ((new Date(dateTime).getTime() - dayStart.getTime()) / dayDuration) * 100;
              const planet = getConjunctingPlanet(timing);
              if (!planet) return null;

              return (
                <div
                  key={`${dateTime}-${timing.aspect.point1.value.name}-${timing.aspect.point2.value.name}`}
                  className="absolute left-3 right-1 z-10 flex -translate-y-1/2 items-center"
                  style={{ top: `${top}%` }}
                >
                  <span className="h-px w-2 shrink-0 bg-rose-400" />
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-sm transition hover:border-rose-400 hover:shadow-md"
                    title={`${ZodiacData[planet.sign].displayName} ${PlanetsData[planet.name].displayName} conjuncts ASC`}
                    aria-label={`${PlanetsData[planet.name].displayName} conjuncts ASC at ${formatTime(new Date(dateTime).getTime())}`}
                    onClick={() => open({ type: "dailyAspectTiming", value: timing })}
                  >
                    {PlanetsData[planet.name].glyph}
                  </button>
                  <span className="ml-2 whitespace-nowrap text-[10px] font-medium tabular-nums text-gray-600">
                    {formatTime(new Date(dateTime).getTime())}
                  </span>
                </div>
              );
            })}
            {conjunctions.length === 0 && (
              <p className="absolute left-6 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                No exact ASC conjunctions today
              </p>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 z-20"
            style={{ top: `${nowPosition}%` }}
            aria-label={`Current ascendant: ${ZodiacData[ascendant.sign].displayName}`}
          >
            <div className="border-t-2 border-rose-500" />
            <span className="absolute left-1 top-0 -translate-y-1/2 rounded-sm bg-rose-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
              NOW
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const buildSignSegments = (
  transitions: { timing: AngleTiming; time: number }[],
  currentSign: ZodiacSign,
  dayStart: number,
  dayEnd: number,
): SignSegment[] => {
  const priorSign = transitions.filter(({ time }) => time <= dayStart).at(-1)?.timing.angle.sign;
  const inDay = transitions.filter(({ time }) => time > dayStart && time < dayEnd);
  const firstSign =
    priorSign ?? (inDay[0] ? previousSign(inDay[0].timing.angle.sign) : currentSign);
  const segments: SignSegment[] = [];
  let cursor = dayStart;
  let sign = firstSign;

  inDay.forEach(({ timing, time }) => {
    segments.push({ sign, start: cursor, end: time });
    cursor = time;
    sign = timing.angle.sign;
  });
  segments.push({ sign, start: cursor, end: dayEnd });

  return segments.filter((segment) => segment.end > segment.start);
};

const getConjunctionEvents = (
  aspects: AspectTiming[],
  dayStart: number,
  dayEnd: number,
): ConjunctionEvent[] =>
  aspects
    .flatMap((timing) => timing.exactDateRanges.map(({ dateTime }) => ({ timing, dateTime })))
    .filter(({ dateTime }) => {
      const time = new Date(dateTime).getTime();
      return time >= dayStart && time < dayEnd;
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

const getConjunctingPlanet = (timing: AspectTiming) => {
  if (timing.aspect.point1.type === "Planet") return timing.aspect.point1.value;
  if (timing.aspect.point2.type === "Planet") return timing.aspect.point2.value;
  return undefined;
};

const previousSign = (sign: ZodiacSign): ZodiacSign => {
  const index = ZodiacSigns.indexOf(sign);
  return ZodiacSigns[(index + ZodiacSigns.length - 1) % ZodiacSigns.length] as ZodiacSign;
};
