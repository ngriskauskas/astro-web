import { useDesc } from "../../contexts/DescContext";
import { useMoonTimings } from "../../hooks/timings/useMoonTimings";
import {
  getMoonPhase,
  MOON_PHASES,
  MoonPhasesData,
  type MoonPhase,
  type MoonPhaseTiming,
} from "../../types/moon";
import { ZodiacData } from "../../types/zodiac";
import { PlanetsData } from "../../types/planet";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { formatDegMin } from "../../utils/funcs";
import { Spinner } from "../utils/Spinner";
import { LoadError } from "../utils/LoadError";

export const MoonTimings = () => {
  const { loading, timings, error } = useMoonTimings();
  const { planetAngles } = useWheel() as SingleWheelContextType;
  const currentMoon = planetAngles.find((planet) => planet.name === "MOON");
  const currentPhase = timings ? getMoonPhase(timings.currentPhase.phase) : undefined;
  const phaseTimings = new Map<MoonPhase, MoonPhaseTiming>();
  const orderedPhaseTimings = [...(timings?.phaseLoop ?? [])]
    .filter((timing) => Number.isFinite(new Date(timing.dateTime).getTime()))
    .sort((left, right) => new Date(left.dateTime).getTime() - new Date(right.dateTime).getTime());

  orderedPhaseTimings.forEach((timing) => {
    const phase = getMoonPhase(timing.phase);
    if (phase && !phaseTimings.has(phase)) phaseTimings.set(phase, timing);
  });
  const phasesByTime = [...MOON_PHASES].sort((leftPhase, rightPhase) => {
    const leftTime = phaseTimings.get(leftPhase)?.dateTime;
    const rightTime = phaseTimings.get(rightPhase)?.dateTime;
    if (!leftTime)
      return rightTime ? 1 : MOON_PHASES.indexOf(leftPhase) - MOON_PHASES.indexOf(rightPhase);
    if (!rightTime) return -1;
    return new Date(leftTime).getTime() - new Date(rightTime).getTime();
  });

  return (
    <section aria-labelledby="moon-heading" className="border-t border-gray-200 py-5">
      <div className="mb-3 flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id="moon-heading" className="text-lg font-semibold text-gray-900">
          Moon Timings
        </h2>
        {currentMoon && (
          <div
            className="inline-flex items-center gap-1.5 text-xs text-gray-600"
            aria-label={`Current Moon placement: ${ZodiacData[currentMoon.sign].displayName} ${formatDegMin(currentMoon.position.degMin)}`}
          >
            <span
              className="text-base"
              style={{ color: PlanetsData.MOON.color }}
              aria-hidden="true"
            >
              {PlanetsData.MOON.glyph}
            </span>
            <span className="font-medium">Moon</span>
            <img src={ZodiacData[currentMoon.sign].glyph} alt="" className="h-4 w-4" />
            <span>{ZodiacData[currentMoon.sign].displayName}</span>
            <span className="font-mono tabular-nums">
              {formatDegMin(currentMoon.position.degMin)}
            </span>
          </div>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : timings && !error ? (
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {phasesByTime.map((phase) => (
            <PhaseSummary
              key={phase}
              phase={phase}
              timing={phaseTimings.get(phase)}
              isCurrent={phase === currentPhase}
            />
          ))}
        </div>
      ) : (
        <LoadError message="Moon timings are unavailable right now." />
      )}
    </section>
  );
};

const PhaseSummary = ({
  phase,
  timing,
  isCurrent,
}: {
  phase: MoonPhase;
  timing?: MoonPhaseTiming;
  isCurrent: boolean;
}) => {
  const { open } = useDesc();
  const phaseData = MoonPhasesData[phase];
  const displayName = phase.replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <button
      type="button"
      className={`flex min-h-20 w-full min-w-0 cursor-pointer flex-col items-start justify-between gap-2 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 ${
        isCurrent ? "border-gray-800 bg-gray-100" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
      onClick={() => open({ type: "moonphase", value: { phase, timing } })}
      aria-label={`View ${displayName} details`}
      aria-current={isCurrent ? "true" : undefined}
    >
      <span className="text-2xl" aria-hidden="true">
        {phaseData.glyph}
      </span>
      <span className="min-w-0 text-xs font-medium leading-tight text-gray-900">{displayName}</span>
      {timing ? (
        <>
          <time className="text-[10px] leading-tight text-gray-500" dateTime={timing.dateTime}>
            {new Date(timing.dateTime).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          <span className="flex min-w-0 items-center gap-1 text-[10px] leading-tight text-gray-600">
            <img src={ZodiacData[timing.planet.sign].glyph} alt="" className="h-3 w-3 shrink-0" />
            <span className="truncate">{ZodiacData[timing.planet.sign].displayName}</span>
          </span>
        </>
      ) : (
        <span className="text-[10px] text-gray-400">Timing unavailable</span>
      )}
    </button>
  );
};
