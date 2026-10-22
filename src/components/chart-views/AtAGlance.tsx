import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { usePlanetaryHours } from "../../hooks/usePlanetaryHours";
import { useWheel } from "../../hooks/useWheel";
import { PlanetsData } from "../../types/planet";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";
import { formatDegMin } from "../../utils/funcs";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";
import { Widget, type WidgetProps } from "../widgets/Widget";
import { useDesc } from "../../contexts/DescContext";
import { currentPlanetaryHour } from "../../utils/planetaryHours";

// The four placements people look up most, plus today's planetary day ruler, in one place.
export const AtAGlance = ({ className }: WidgetProps) => (
  <Widget id="glance" title="At a glance" tone="glance" className={className}>
    <AtAGlanceBody />
  </Widget>
);

const AtAGlanceBody = () => {
  const { planetAngles, keyAngles, status } = useWheel() as SingleWheelContextType;
  const { data, now } = usePlanetaryHours();
  const { open } = useDesc();

  if (status === "error") return <LoadError message="Could not load the chart." />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  const sun = planetAngles.find((planet) => planet.name === "SUN");
  const moon = planetAngles.find((planet) => planet.name === "MOON");
  const rising = keyAngles.find((angle) => angle.name === "ASC");
  const midheaven = keyAngles.find((angle) => angle.name === "MC");
  const dayRulerName = data ? currentPlanetaryHour(data, now)?.hour.dayRuler : undefined;
  const dayRuler = dayRulerName ? PlanetsData[dayRulerName] : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-2 gap-3">
        {sun && (
          <Tile
            label="Sun"
            sign={sun.sign}
            detail={formatDegMin(sun.position.degMin)}
            onClick={() => open({ type: "planet", value: sun.name })}
          />
        )}
        {moon && (
          <Tile
            label="Moon"
            sign={moon.sign}
            detail={formatDegMin(moon.position.degMin)}
            onClick={() => open({ type: "planet", value: moon.name })}
          />
        )}
        {rising && (
          <Tile
            label="Rising"
            sign={rising.sign}
            detail={formatDegMin(rising.position.degMin)}
            onClick={() => open({ type: "angle", value: rising.name })}
          />
        )}
        {midheaven && (
          <Tile
            label="Midheaven"
            sign={midheaven.sign}
            detail={formatDegMin(midheaven.position.degMin)}
            onClick={() => open({ type: "angle", value: midheaven.name })}
          />
        )}
      </div>
      {dayRuler && (
        <button
          type="button"
          aria-label={`View ${dayRuler.displayName} day ruler details`}
          onClick={() => {
            if (dayRulerName) open({ type: "planet", value: dayRulerName });
          }}
          className="mt-4 flex w-full cursor-pointer items-center gap-2 border-t border-gray-200 pt-3 text-left text-sm text-gray-700 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
        >
          <span aria-hidden="true" style={{ color: dayRuler.color }} className="text-lg">
            {dayRuler.glyph}
          </span>
          <span>
            Day ruler: <span className="font-medium text-gray-900">{dayRuler.displayName}</span>
          </span>
        </button>
      )}
    </div>
  );
};

const Tile = ({
  label,
  sign,
  detail,
  onClick,
}: {
  label: string;
  sign: ZodiacSign;
  detail: string;
  onClick: () => void;
}) => {
  const info = ZodiacData[sign];

  return (
    <button
      type="button"
      aria-label={`View ${label} details`}
      onClick={onClick}
      className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
      style={{
        borderColor: `${info.color}55`,
        background: `linear-gradient(135deg, ${info.color}1f, transparent 80%)`,
      }}
    >
      <img src={info.glyph} alt="" className="h-9 w-7 shrink-0" />
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
        <span className="block truncate font-medium text-gray-900">{info.displayName}</span>
        <span className="block text-xs tabular-nums text-gray-600">{detail}</span>
      </span>
    </button>
  );
};
