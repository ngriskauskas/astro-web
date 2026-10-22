import { Fragment, useEffect, useRef, useState } from "react";
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
import { Widget, WidgetViewSwitch, type WidgetProps } from "../widgets/Widget";
import { ASCENDANT_LOOKS, ASCENDANT_STYLES, type AscendantLook } from "./ascendantStyles";

const TRACK_HEIGHT = 2160;
const MARKER_HEIGHT = 44;
const MARKER_GAP = MARKER_HEIGHT + 12;

// Time labels, signs, (planetary hours,) conjunction markers.
const COLUMNS =
  "grid-cols-[2.75rem_minmax(4.5rem,1.4fr)_minmax(6.5rem,1fr)] sm:grid-cols-[3rem_minmax(6rem,1.4fr)_minmax(6rem,1fr)]";
const COLUMNS_WITH_HOURS =
  "grid-cols-[2.25rem_minmax(3.5rem,1fr)_minmax(3.5rem,1fr)_minmax(7rem,1.2fr)] sm:grid-cols-[3rem_minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(7rem,1.2fr)]";

interface SignSegment {
  sign: ZodiacSign;
  start: number;
  end: number;
}

interface ConjunctionEvent {
  timing: AspectTiming;
  dateTime: string;
}

interface PositionedConjunction extends ConjunctionEvent {
  exactPosition: number;
  displayPosition: number;
}

export const DailyAscendantTimeline = ({ className }: WidgetProps) => {
  const wheel = useWheel();
  const keyAngles = isMulti(wheel)
    ? (wheel as MultiWheelContextType).otherKeyAngles
    : (wheel as SingleWheelContextType).keyAngles;
  const { timings, loading, error } = useDailyTimings();
  const { open } = useDesc();
  const [look, setLook] = useState<AscendantLook>("light");
  const style = ASCENDANT_STYLES[look];
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
  const positionedConjunctions = positionConjunctions(conjunctions, dayStart.getTime(), dayDuration);
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

  if (!ready) {
    return (
      <Widget id="ascendant" title="Ascendant Today" tone="ascendant" size="narrow" className={className}>
        {error ? (
          <LoadError message="Could not load today's timings." />
        ) : wheel.status === "error" ? (
          <LoadError message="Could not load the chart." />
        ) : (
          <Spinner />
        )}
      </Widget>
    );
  }

  return (
    <Widget
      id="ascendant"
      title="Ascendant Today"
      tone="ascendant"
      size="narrow"
      className={className}
      actions={
        <WidgetViewSwitch
          label="Ascendant style"
          value={look}
          options={ASCENDANT_LOOKS}
          onChange={setLook}
        />
      }
    >
      <button
        type="button"
        aria-label="View Ascendant details"
        onClick={() => open({ type: "angle", value: ascendant.name })}
        className="mb-3 flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
      >
        <span className="text-[10px] font-semibold uppercase text-gray-500">ASC</span>
        <img src={ZodiacData[ascendant.sign].glyph} alt="" className="h-4 w-4" />
        <span className="font-medium">{ZodiacData[ascendant.sign].displayName}</span>
        <span className="text-gray-500">{formatDegMin(ascendant.position.degMin)}</span>
      </button>

      <div
        ref={scrollRef}
        data-timeline-viewport
        style={style.viewportStyle}
        className={`max-h-[460px] overflow-y-auto rounded-xl border ${style.viewport}`}
      >
        <div
          className={`relative grid ${hourBlocks ? COLUMNS_WITH_HOURS : COLUMNS}`}
          style={{ height: TRACK_HEIGHT }}
        >
          {style.ambient && <div aria-hidden="true" className="ascendant-aurora" data-look={look} />}
          <div className={`relative text-[10px] ${style.time}`}>
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

          <div className={`relative overflow-hidden ${style.signColumn}`}>
            {signSegments.map((segment) => {
              const signInfo = ZodiacData[segment.sign];
              const top = ((segment.start - dayStart.getTime()) / dayDuration) * 100;
              const height = ((segment.end - segment.start) / dayDuration) * 100;
              return (
                <button
                  type="button"
                  key={`${segment.sign}-${segment.start}`}
                  aria-label={`View ${ZodiacData[segment.sign].displayName} sign details`}
                  title={`${ZodiacData[segment.sign].displayName} from ${formatTime(segment.start)}`}
                  onClick={() => open({ type: "sign", value: segment.sign })}
                  className={`absolute inset-x-0 flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden px-1 text-center ${style.sign}`}
                  style={{
                    ...style.signStyle(signInfo.color),
                    top: `${top}%`,
                    height: `${height}%`,
                  }}
                >
                  <img
                    src={signInfo.glyph}
                    alt=""
                    className={style.signGlyph}
                  />
                  <span className={style.signLabel}>
                    {ZodiacData[segment.sign].displayName}
                  </span>
                </button>
              );
            })}
          </div>

          {hourBlocks && (
            <div
              role="list"
              aria-label="Planetary hours"
              className={`relative ${style.hourColumn}`}
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
                    className={`absolute inset-x-0 flex flex-col items-center overflow-hidden ${style.hour} ${
                      isCurrent ? "z-[1]" : ""
                    }`}
                    style={{
                      ...style.hourStyle(planet.color, isDay, isCurrent),
                      top: `${((top - dayStart.getTime()) / dayDuration) * 100}%`,
                      height: `${((bottom - top) / dayDuration) * 100}%`,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`View ${name} details`}
                      onClick={() =>
                        open({
                          type: "planetaryHour",
                          value: { hour, end: new Date(end) },
                        })
                      }
                      className="absolute inset-0 flex cursor-pointer flex-col items-center overflow-hidden transition-[filter,transform] duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:brightness-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-gray-700"
                    >
                      {/* The line at the top of a block is where its hour starts. An hour that
                          began before midnight has no line of its own on this day. */}
                      {top === start && (
                        <time
                          dateTime={hour.dateTime}
                          className={`mt-0.5 whitespace-nowrap text-[7px] font-medium leading-none tabular-nums sm:text-[8px] ${style.hourText}`}
                        >
                          {formatTime(start)}
                        </time>
                      )}
                      {/* Hours 1 and 13 begin at sunrise and sunset. */}
                      {(hour.hour === 1 || hour.hour === 13) && (
                        <span className={`mt-0.5 text-[7px] font-semibold uppercase leading-none sm:text-[8px] ${style.hourText}`}>
                          {isDay ? "Sunrise" : "Sunset"}
                        </span>
                      )}
                      <span
                        className={`flex min-h-0 flex-1 items-center justify-center font-semibold leading-none transition-transform duration-300 ease-out hover:scale-125 ${style.hourGlyph} ${
                          isCurrent ? "scale-110" : ""
                        }`}
                        style={style.hourGlyphStyle(planet.color, isCurrent)}
                        aria-hidden="true"
                      >
                        {planet.glyph}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative min-w-0">
            <div className={`absolute inset-y-0 left-2 border-l border-dashed ${style.rail}`} />
            {positionedConjunctions.map(({ timing, dateTime, exactPosition, displayPosition }) => {
              const planet = getConjunctingPlanet(timing);
              if (!planet) return null;
              const planetInfo = PlanetsData[planet.name];
              const exactTop = `${(exactPosition / TRACK_HEIGHT) * 100}%`;
              const displayTop = `${(displayPosition / TRACK_HEIGHT) * 100}%`;
              const connectorTop = Math.min(exactPosition, displayPosition);
              const connectorHeight = Math.abs(displayPosition - exactPosition);

              return (
                <Fragment
                  key={`${dateTime}-${timing.aspect.point1.value.name}-${timing.aspect.point2.value.name}`}
                >
                  {connectorHeight > 0 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-2 z-0 w-px ${style.connector}`}
                      style={{
                        top: `${(connectorTop / TRACK_HEIGHT) * 100}%`,
                        height: `${(connectorHeight / TRACK_HEIGHT) * 100}%`,
                      }}
                    />
                  )}
                  <span
                    className={`absolute left-2 z-[1] h-px w-2 ${style.tick}`}
                    style={{ top: exactTop }}
                  />
                  <div
                    data-conjunction-marker
                    className="absolute left-4 right-1 z-10 flex -translate-y-1/2 items-center"
                    style={{ top: displayTop }}
                  >
                    <button
                      type="button"
                      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center sm:h-9 sm:w-9 ${style.marker}`}
                      title={`${ZodiacData[planet.sign].displayName} ${PlanetsData[planet.name].displayName} conjuncts ASC`}
                      aria-label={`${PlanetsData[planet.name].displayName} conjuncts ASC at ${formatTime(new Date(dateTime).getTime())}`}
                      onClick={() => open({ type: "dailyAspectTiming", value: timing })}
                      style={style.markerStyle(planetInfo.color)}
                    >
                      {planetInfo.glyph}
                    </button>
                    <span className={`ml-1 whitespace-nowrap rounded-full border px-1 py-0.5 text-[8px] font-semibold tabular-nums shadow-sm sm:px-1.5 sm:text-[9px] ${style.chip}`}>
                      {formatTime(new Date(dateTime).getTime())}
                    </span>
                  </div>
                </Fragment>
              );
            })}
            {conjunctions.length === 0 && (
              <p className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs ${style.empty}`}>
                No exact ASC conjunctions today
              </p>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 z-20"
            style={{ top: `${nowPosition}%` }}
            aria-label={`Current ascendant: ${ZodiacData[ascendant.sign].displayName}`}
          >
            <div className={`border-t-2 ${style.nowLine}`} />
            <span className={`absolute left-1 top-0 -translate-y-1/2 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${style.nowLabel}`}>
              NOW
            </span>
          </div>
        </div>
      </div>
    </Widget>
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

const positionConjunctions = (
  events: ConjunctionEvent[],
  dayStart: number,
  dayDuration: number,
): PositionedConjunction[] => {
  if (events.length === 0) return [];
  const minimum = MARKER_HEIGHT / 2 + 4;
  const maximum = TRACK_HEIGHT - minimum;
  const gap = Math.min(MARKER_GAP, (maximum - minimum) / Math.max(1, events.length - 1));
  const positioned = events.map((event) => {
    const exactPosition =
      ((new Date(event.dateTime).getTime() - dayStart) / dayDuration) * TRACK_HEIGHT;
    return {
      ...event,
      exactPosition,
      displayPosition: Math.max(minimum, Math.min(maximum, exactPosition)),
    };
  });

  for (let index = 1; index < positioned.length; index++) {
    positioned[index].displayPosition = Math.max(
      positioned[index].displayPosition,
      positioned[index - 1].displayPosition + gap,
    );
  }
  positioned[positioned.length - 1].displayPosition = Math.min(
    positioned[positioned.length - 1].displayPosition,
    maximum,
  );
  for (let index = positioned.length - 2; index >= 0; index--) {
    positioned[index].displayPosition = Math.min(
      positioned[index].displayPosition,
      positioned[index + 1].displayPosition - gap,
    );
  }

  return positioned;
};

const getConjunctingPlanet = (timing: AspectTiming) => {
  if (timing.aspect.point1.type === "Planet") return timing.aspect.point1.value;
  if (timing.aspect.point2.type === "Planet") return timing.aspect.point2.value;
  return undefined;
};

const previousSign = (sign: ZodiacSign): ZodiacSign => {
  const index = ZodiacSigns.indexOf(sign);
  return ZodiacSigns[(index + ZodiacSigns.length - 1) % ZodiacSigns.length] as ZodiacSign;
};
