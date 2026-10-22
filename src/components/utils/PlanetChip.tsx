import { useDesc } from "../../contexts/DescContext";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "./chipStyles";

// `interactive={false}` draws the chip without making it a button, for use inside
// something that is already one.
export const PlanetChip = ({
  planet,
  owner,
  interactive = true,
}: {
  planet: PlanetName;
  owner?: OwnerType;
  interactive?: boolean;
}) => {
  const { open } = useDesc();
  const planetInfo = PlanetsData[planet];
  const style = chipTint(planetInfo.color);
  const content = (
    <>
      <span className="text-sm leading-none" aria-hidden="true">
        {planetInfo.glyph}
      </span>
      <span>{planetInfo.displayName}</span>
    </>
  );

  if (!interactive) {
    return (
      <span className={CHIP_BASE} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE}`}
      onClick={() => open({ type: "planet", value: planet, owner })}
      style={style}
    >
      {content}
    </button>
  );
};

export const PlanetGroup = ({
  title,
  planets,
  owner,
}: {
  title: string;
  planets: PlanetName[];
  owner?: "main" | "other";
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</span>

    <div className="flex flex-wrap gap-1.5">
      {planets.length === 0 ? (
        <span className="text-sm text-gray-500">—</span>
      ) : (
        planets.map((planet) => <PlanetChip key={planet} planet={planet} owner={owner} />)
      )}
    </div>
  </div>
);
