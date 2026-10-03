import { useDesc } from "../../contexts/DescContext";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { PlanetsData, type PlanetName } from "../../types/planet";

const CHIP =
  "flex items-center gap-1 px-1.5 py-0.5 bg-white border rounded shadow-sm text-xs font-medium justify-center";

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
  const color = planetInfo.color;
  const style = {
    backgroundColor: `${color}11`, // color with low opacity
    borderColor: `${color}55`,
  };
  const content = (
    <>
      <span className="text-base" aria-hidden="true">
        {planetInfo.glyph}
      </span>
      <span>{planetInfo.displayName}</span>
    </>
  );

  if (!interactive) {
    return (
      <span className={CHIP} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={`${CHIP} cursor-pointer hover:shadow-md transition-all`}
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
  <div className="flex flex-col gap-1">
    <span className="text-gray-500 text-xs uppercase tracking-wide">{title}</span>

    <div className="flex flex-wrap gap-1">
      {planets.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        planets.map((planet) => <PlanetChip key={planet} planet={planet} owner={owner} />)
      )}
    </div>
  </div>
);
