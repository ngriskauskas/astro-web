import { usePlanetaryHours } from "../../hooks/usePlanetaryHours";
import { PlanetsData } from "../../types/planet";
import type { ClassicalPlanet } from "../../types/planetaryHours";
import { formatTime } from "../../utils/funcs";
import { currentPlanetaryHour } from "../../utils/planetaryHours";
import { Spinner } from "../utils/Spinner";
import { LoadError } from "../utils/LoadError";

export const PlanetaryHourWidget = () => {
  const { status, data, now } = usePlanetaryHours();
  const current = data ? currentPlanetaryHour(data, now) : undefined;
  // The planetary day runs to the next sunrise: today's if it has not risen yet.
  const dayEnds = data && new Date(now < new Date(data.sunrise) ? data.sunrise : data.dayEnd);

  // How far through the current hour we are, for the progress bar under the tiles.
  const hourStart = current ? new Date(current.hour.dateTime).getTime() : 0;
  const progress = current
    ? Math.min(100, Math.max(0, ((now.getTime() - hourStart) / (current.end.getTime() - hourStart)) * 100))
    : 0;

  return (
    <section aria-labelledby="planetary-hour-heading">
      <h2 id="planetary-hour-heading" className="mb-3 text-lg font-semibold text-gray-900">
        Planetary Hour
      </h2>
      {status === "loading" ? (
        <Spinner />
      ) : status === "unavailable" ? (
        <LoadError message="Planetary hours are not available for this location today." />
      ) : !data || !current ? (
        <LoadError message="Could not load planetary hours." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {/* Before sunrise the day is still the one that began at the previous sunrise,
                so its ruler comes from the current hour, not from the calendar date. */}
            <RulerTile label="Day" role="Day ruler" ruler={current.hour.dayRuler}>
              <span className={DETAIL}>Until sunrise</span>
              <span className={`${DETAIL} tabular-nums`}>{formatTime(dayEnds!.getTime())}</span>
            </RulerTile>
            <RulerTile label="Hour" role="Hour ruler" ruler={current.hour.ruler} isCurrent>
              <span className={DETAIL}>
                Hour {current.hour.hour} · {current.hour.period === "DAY" ? "Day" : "Night"}
              </span>
              <span className={`${DETAIL} tabular-nums`}>
                {formatTime(new Date(current.hour.dateTime).getTime())} –{" "}
                {formatTime(current.end.getTime())}
              </span>
            </RulerTile>
          </div>
          <div
            role="progressbar"
            aria-label="Time through this hour"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%`, backgroundColor: PlanetsData[current.hour.ruler].color }}
            />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-gray-600">
            {current.next && (
              <p>
                Next: <span aria-hidden="true">{PlanetsData[current.next.ruler].glyph}</span>{" "}
                {PlanetsData[current.next.ruler].displayName} at{" "}
                {formatTime(new Date(current.next.dateTime).getTime())}
              </p>
            )}
            <p className="tabular-nums">
              Sunrise {formatTime(new Date(data.sunrise).getTime())} · Sunset{" "}
              {formatTime(new Date(data.sunset).getTime())}
            </p>
          </div>
        </>
      )}
    </section>
  );
};

// One line of detail under a ruler's name. Kept on one line: on a phone the tile stacks
// its symbol above the text to leave room for a time range.
const DETAIL = "whitespace-nowrap text-[11px] leading-tight text-gray-600 sm:text-xs";

const RulerTile = ({
  label,
  role,
  ruler,
  isCurrent = false,
  children,
}: {
  label: string;
  role: string;
  ruler: ClassicalPlanet;
  isCurrent?: boolean;
  children?: React.ReactNode;
}) => {
  const planet = PlanetsData[ruler];

  return (
    <div
      role="group"
      aria-label={`${role}: ${planet.displayName}`}
      className={`flex min-w-0 flex-col items-start gap-2 rounded-xl border p-3 sm:flex-row sm:gap-3 ${
        isCurrent ? "border-gray-300" : "border-gray-200 bg-white"
      }`}
      style={
        isCurrent
          ? { background: `linear-gradient(135deg, ${planet.color}33, transparent 70%)` }
          : undefined
      }
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-gray-800"
        style={{ backgroundColor: `${planet.color}24` }}
        aria-hidden="true"
      >
        {planet.glyph}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase text-gray-500">{label}</span>
        <span className="text-sm font-medium leading-tight text-gray-900">
          {planet.displayName}
        </span>
        {children}
      </div>
    </div>
  );
};
