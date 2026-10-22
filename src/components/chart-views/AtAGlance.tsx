import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { usePlanetaryHours } from "../../hooks/usePlanetaryHours";
import { useWheel } from "../../hooks/useWheel";
import { PlanetsData } from "../../types/planet";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";
import { formatDegMin } from "../../utils/funcs";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";

// The four placements people look up most, plus today's planetary day ruler, in one place.
export const AtAGlance = () => {
  const { planetAngles, keyAngles, status } = useWheel() as SingleWheelContextType;
  const { data } = usePlanetaryHours();

  if (status === "error") return <LoadError message="Could not load the chart." />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  const sun = planetAngles.find((planet) => planet.name === "SUN");
  const moon = planetAngles.find((planet) => planet.name === "MOON");
  const rising = keyAngles.find((angle) => angle.name === "ASC");
  const midheaven = keyAngles.find((angle) => angle.name === "MC");
  const dayRuler = data && PlanetsData[data.dayRuler];

  return (
    <section aria-labelledby="glance-heading" className="flex h-full flex-col">
      <h2 id="glance-heading" className="mb-3 text-lg font-semibold text-gray-900">
        At a glance
      </h2>
      <dl className="grid flex-1 grid-cols-2 gap-3">
        {sun && <Tile label="Sun" sign={sun.sign} detail={formatDegMin(sun.position.degMin)} />}
        {moon && <Tile label="Moon" sign={moon.sign} detail={formatDegMin(moon.position.degMin)} />}
        {rising && <Tile label="Rising" sign={rising.sign} detail={formatDegMin(rising.position.degMin)} />}
        {midheaven && (
          <Tile label="Midheaven" sign={midheaven.sign} detail={formatDegMin(midheaven.position.degMin)} />
        )}
      </dl>
      {dayRuler && (
        <p className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-3 text-sm text-gray-700">
          <span aria-hidden="true" style={{ color: dayRuler.color }} className="text-lg">
            {dayRuler.glyph}
          </span>
          <span>
            Day ruler: <span className="font-medium text-gray-900">{dayRuler.displayName}</span>
          </span>
        </p>
      )}
    </section>
  );
};

const Tile = ({ label, sign, detail }: { label: string; sign: ZodiacSign; detail: string }) => {
  const info = ZodiacData[sign];

  return (
    <div
      className="flex min-w-0 items-center gap-3 rounded-xl border p-3 transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: `${info.color}55`,
        background: `linear-gradient(135deg, ${info.color}1f, transparent 80%)`,
      }}
    >
      <img src={info.glyph} alt="" className="h-9 w-7 shrink-0" />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
        <dd className="m-0 truncate font-medium text-gray-900">{info.displayName}</dd>
        <dd className="m-0 text-xs tabular-nums text-gray-600">{detail}</dd>
      </div>
    </div>
  );
};
