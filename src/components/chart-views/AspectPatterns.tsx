import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useProfileNames } from "../../hooks/chart/getNames";
import { isMulti, useWheel } from "../../hooks/useWheel";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { AspectPatternData, type AspectPattern } from "../../types/aspectPattern";
import { PlanetsData } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";
import { LoadError } from "../utils/LoadError";
import { PlanetChip } from "../utils/PlanetChip";
import { Spinner } from "../utils/Spinner";

// The shapes planets make together in this chart: grand trines, T-squares, yods and stelliums.
// A two-chart view shows each side's shapes under that side's name.
export const AspectPatternsList = () => {
  const ctx = useWheel();
  const { mainProfileName, otherProfileName } = useProfileNames();

  if (isMulti(ctx)) {
    const multi = ctx as MultiWheelContextType;
    if (multi.status === "error") return <LoadError message="Could not load the aspect patterns." />;
    if (multi.status === "loading") return <Spinner />;
    const otherDefault = multi.type === "transit" ? "Transits" : "Other Profile";
    return (
      <div className="flex flex-col gap-5">
        <Side title={mainProfileName ?? "Natal"} patterns={multi.mainPatterns} owner="main" />
        <Side title={otherProfileName ?? otherDefault} patterns={multi.otherPatterns} owner="other" />
      </div>
    );
  }

  if (ctx.status === "error") return <LoadError message="Could not load the aspect patterns." />;
  if (ctx.status === "loading") return <Spinner />;
  return <Side patterns={ctx.patterns} />;
};

// One side's shapes, or a plain line when it has none.
const Side = ({
  title,
  patterns,
  owner,
}: {
  title?: string;
  patterns: AspectPattern[];
  owner?: OwnerType;
}) => (
  <div className="flex flex-col gap-2">
    {title && <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</h3>}
    {patterns.length === 0 ? (
      <p className="text-sm text-gray-500">No aspect patterns on {title ? "this side" : "this chart"}.</p>
    ) : (
      <ul className="flex flex-col gap-2">
        {patterns.map((pattern, index) => (
          <PatternCard key={index} pattern={pattern} owner={owner} />
        ))}
      </ul>
    )}
  </div>
);

// One shape: its name and where it sits, a short reading of it, and the planets that make it up.
// The focal planet of a T-square or yod is marked, since that is where the shape points.
const PatternCard = ({ pattern, owner }: { pattern: AspectPattern; owner?: OwnerType }) => {
  const info = AspectPatternData[pattern.type];
  const headline = pattern.sign ? `${info.name} in ${ZodiacData[pattern.sign].displayName}` : info.name;
  return (
    <li
      className="rounded-xl border p-3"
      style={{
        borderColor: `${info.color}55`,
        background: `linear-gradient(135deg, ${info.color}14, transparent 80%)`,
      }}
    >
      <h4 className="text-sm font-semibold text-gray-900">{headline}</h4>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{info.description}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pattern.planets.map((planet) => (
          <PlanetChip key={planet} planet={planet} owner={owner} />
        ))}
      </div>
      {pattern.focus && (
        <p className="mt-2 text-xs text-gray-600">
          Points to <span className="font-medium text-gray-900">{PlanetsData[pattern.focus].displayName}</span>
        </p>
      )}
    </li>
  );
};
