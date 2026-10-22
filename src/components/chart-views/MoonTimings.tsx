import { useState, type CSSProperties, type ReactNode } from "react";
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
import { Widget, WidgetViewSwitch, type WidgetProps } from "../widgets/Widget";

type MoonView = "orbit" | "path" | "phases";

const MOON_VIEWS = [
  { id: "orbit", label: "Orbit" },
  { id: "path", label: "Timeline" },
  { id: "phases", label: "Phases" },
] as const;

const displayPhase = (phase: MoonPhase) =>
  phase.replace(/\b\w/g, (letter) => letter.toUpperCase());

export const MoonTimings = ({ className }: WidgetProps) => {
  const { loading, timings, error } = useMoonTimings();
  const { open } = useDesc();
  const { planetAngles } = useWheel() as SingleWheelContextType;
  const currentMoon = planetAngles.find((planet) => planet.name === "MOON");
  const currentPhase = timings ? getMoonPhase(timings.currentPhase.phase) : undefined;
  const [view, setView] = useState<MoonView>("orbit");
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
    <Widget
      id="moon"
      title="Moon Timings"
      tone="moon"
      className={className}
      actions={
        <>
          {currentMoon && (
            <button
              type="button"
              aria-label={`Current Moon placement: ${ZodiacData[currentMoon.sign].displayName} ${formatDegMin(currentMoon.position.degMin)}`}
              onClick={() => open({ type: "planet", value: currentMoon.name })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded text-xs text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
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
            </button>
          )}
          <WidgetViewSwitch
            label="Moon timing view"
            value={view}
            options={MOON_VIEWS}
            onChange={setView}
          />
        </>
      }
    >
      {loading ? (
        <Spinner />
      ) : timings && !error ? (
        <div key={view} className="animate-[moon-view-in_350ms_ease-out_both] motion-reduce:animate-none">
          {view === "orbit" ? (
            <OrbitView
              phases={phasesByTime}
              phaseTimings={phaseTimings}
              currentPhase={currentPhase}
              currentMoon={currentMoon}
            />
          ) : view === "path" ? (
            <PathView
              phases={phasesByTime}
              phaseTimings={phaseTimings}
              currentPhase={currentPhase}
            />
          ) : (
            <PhaseGrid
              phases={phasesByTime}
              phaseTimings={phaseTimings}
              currentPhase={currentPhase}
            />
          )}
        </div>
      ) : (
        <LoadError message="Moon timings are unavailable right now." />
      )}
    </Widget>
  );
};

type PhaseViewProps = {
  phases: MoonPhase[];
  phaseTimings: Map<MoonPhase, MoonPhaseTiming>;
  currentPhase?: MoonPhase;
};

const PhaseButton = ({
  phase,
  timing,
  isCurrent,
  className = "",
  style,
  children,
}: {
  phase: MoonPhase;
  timing?: MoonPhaseTiming;
  isCurrent: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => {
  const { open } = useDesc();
  const phaseData = MoonPhasesData[phase];
  const date = timing && new Date(timing.dateTime);
  const dateLabel =
    date && Number.isFinite(date.getTime())
      ? date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : undefined;
  return (
    <button
      type="button"
      className={`group cursor-pointer text-left transition duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
        isCurrent ? "ring-1 ring-indigo-300" : ""
      } ${className}`}
      title={`${displayPhase(phase)}${dateLabel ? ` — ${dateLabel}` : " — Timing unavailable"}${timing ? `, ${ZodiacData[timing.planet.sign].displayName}` : ""}`}
      onClick={() => open({ type: "moonphase", value: { phase, timing } })}
      aria-label={`View ${displayPhase(phase)} details`}
      aria-current={isCurrent ? "true" : undefined}
      style={style}
    >
      <span className="sr-only">{displayPhase(phase)}. </span>
      {children ?? phaseData.glyph}
      {date && Number.isFinite(date.getTime()) && (
        <time className="sr-only" dateTime={timing?.dateTime}>
          {date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      )}
      {timing && (
        <span className="sr-only">
          {ZodiacData[timing.planet.sign].displayName}
        </span>
      )}
      {!date || !Number.isFinite(date.getTime()) ? (
        <span className="sr-only">Timing unavailable</span>
      ) : null}
    </button>
  );
};

const OrbitView = ({
  phases,
  phaseTimings,
  currentPhase,
  currentMoon,
}: PhaseViewProps & {
  currentMoon?: SingleWheelContextType["planetAngles"][number];
}) => (
  <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_48%,#77859d_0%,#606f89_55%,#4b5a73_100%)] shadow-[inset_0_0_50px_rgba(226,232,240,0.24)]">
    <div className="pointer-events-none absolute inset-[13%] rounded-full border border-white/25" />
    <div className="pointer-events-none absolute inset-[24%] rounded-full border border-white/20" />
    <div className="pointer-events-none absolute inset-[38%] rounded-full bg-slate-100/10 blur-2xl" />
    {phases.map((phase, index) => {
      const angle = (index / phases.length) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(angle) * 39;
      const y = 50 + Math.sin(angle) * 39;
      const isCurrent = phase === currentPhase;
      const timing = phaseTimings.get(phase);
      const phaseDate = timing ? new Date(timing.dateTime) : undefined;
      const hasDate = phaseDate && Number.isFinite(phaseDate.getTime());
      return (
        <PhaseButton
          key={phase}
          phase={phase}
          timing={timing}
          isCurrent={isCurrent}
          className={`absolute z-10 flex h-[58px] w-[64px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 text-center leading-none shadow-md backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:bg-white/70 hover:shadow-lg motion-reduce:transition-none ${
            isCurrent
              ? "border-white/90 bg-white/65 ring-1 ring-white/50"
              : "border-white/50 bg-white/35"
          }`}
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span aria-hidden="true" className="text-[22px]">
            {MoonPhasesData[phase].glyph}
          </span>
          <span className="max-w-full truncate text-[9px] font-semibold text-slate-800">
            {hasDate
              ? phaseDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "No timing"}
          </span>
          {timing && (
            <span className="flex max-w-full items-center gap-0.5 text-[8px] text-slate-700">
              <img src={ZodiacData[timing.planet.sign].glyph} alt="" className="h-2.5 w-2.5 shrink-0" />
              <span>{ZodiacData[timing.planet.sign].displayName.slice(0, 3)}</span>
            </span>
          )}
        </PhaseButton>
      );
    })}
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-16 text-center text-white">
      <span className="mb-1 animate-[moon-glow_4s_ease-in-out_infinite] text-5xl drop-shadow-[0_0_18px_rgba(255,255,255,0.45)] motion-reduce:animate-none">
        {currentPhase ? MoonPhasesData[currentPhase].glyph : "🌙"}
      </span>
      <span className="text-sm font-semibold">{currentPhase ? displayPhase(currentPhase) : "Moon"}</span>
      {currentMoon && (
        <span className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
          <img src={ZodiacData[currentMoon.sign].glyph} alt="" className="h-3 w-3" />
          {ZodiacData[currentMoon.sign].displayName}
        </span>
      )}
      {currentPhase && phaseTimings.get(currentPhase) && (
        <time
          dateTime={phaseTimings.get(currentPhase)?.dateTime}
          className="mt-1 text-[10px] text-white/75"
        >
          Since{" "}
          {new Date(phaseTimings.get(currentPhase)!.dateTime).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </time>
      )}
      <span className="mt-2 text-[9px] font-medium uppercase tracking-[0.2em] text-white/65">
        Current phase
      </span>
    </div>
  </div>
);

const PathView = ({ phases, phaseTimings, currentPhase }: PhaseViewProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-3 sm:p-4">
    <div className="pointer-events-none absolute bottom-7 left-[1.9rem] top-7 w-px bg-gradient-to-b from-indigo-200 via-violet-200 to-transparent sm:left-8" />
    <ol className="relative space-y-1">
      {phases.map((phase, index) => {
        const timing = phaseTimings.get(phase);
        const isCurrent = phase === currentPhase;
        const date = timing && new Date(timing.dateTime);
        const validDate = date && Number.isFinite(date.getTime());
        return (
          <li
            key={phase}
            className="animate-[moon-row-in_400ms_ease-out_both] motion-reduce:animate-none"
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <PhaseButton
              phase={phase}
              timing={timing}
              isCurrent={isCurrent}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 hover:-translate-y-0.5 hover:shadow-md sm:gap-4 ${
                isCurrent
                  ? "border-indigo-200 bg-white shadow-sm"
                  : "border-transparent bg-white/55 hover:border-indigo-100 hover:bg-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${
                  isCurrent ? "bg-indigo-100" : "bg-white"
                }`}
              >
                {MoonPhasesData[phase].glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{displayPhase(phase)}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-700">
                      Now
                    </span>
                  )}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                  {validDate ? (
                    <time dateTime={timing?.dateTime}>
                      {date.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  ) : (
                    <span>Timing unavailable</span>
                  )}
                  {timing && (
                    <span className="flex items-center gap-1">
                      <img
                        src={ZodiacData[timing.planet.sign].glyph}
                        alt=""
                        className="h-3 w-3"
                      />
                      {ZodiacData[timing.planet.sign].displayName}
                    </span>
                  )}
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                →
              </span>
            </PhaseButton>
          </li>
        );
      })}
    </ol>
  </div>
);

const PhaseGrid = ({ phases, phaseTimings, currentPhase }: PhaseViewProps) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {phases.map((phase, index) => {
      const timing = phaseTimings.get(phase);
      const date = timing && new Date(timing.dateTime);
      const validDate = date && Number.isFinite(date.getTime());
      const isCurrent = phase === currentPhase;
      return (
        <PhaseButton
          key={phase}
          phase={phase}
          timing={timing}
          isCurrent={isCurrent}
          className={`relative flex min-h-[122px] animate-[moon-row-in_400ms_ease-out_both] flex-col overflow-hidden rounded-2xl border p-3 shadow-sm hover:-translate-y-1 hover:shadow-lg motion-reduce:animate-none sm:min-h-[145px] ${
            isCurrent
              ? "border-indigo-300 bg-gradient-to-br from-indigo-100 via-white to-violet-100"
              : "border-slate-100 bg-gradient-to-br from-white to-slate-50 hover:border-indigo-100"
          }`}
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-3 text-6xl opacity-10 transition duration-500 group-hover:rotate-12 group-hover:scale-110"
          >
            {MoonPhasesData[phase].glyph}
          </span>
          <span className="relative text-3xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
            {MoonPhasesData[phase].glyph}
          </span>
          <span className="relative mt-2 text-xs font-semibold leading-tight text-slate-800">
            {displayPhase(phase)}
            {isCurrent && <span className="ml-1 text-[9px] font-semibold uppercase text-indigo-600">Now</span>}
          </span>
          <span className="relative mt-1 text-[10px] leading-tight text-slate-500">
            {validDate
              ? date.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Timing unavailable"}
          </span>
          {timing && (
            <span className="relative mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500">
              <img src={ZodiacData[timing.planet.sign].glyph} alt="" className="h-3 w-3" />
              {ZodiacData[timing.planet.sign].displayName}
            </span>
          )}
        </PhaseButton>
      );
    })}
  </div>
);
