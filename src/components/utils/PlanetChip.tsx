import { useDesc } from "../../contexts/DescContext";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { PlanetsData, type PlanetName } from "../../types/planet";

export const PlanetChip = ({
  planet,
  owner,
}: {
  planet: PlanetName;
  owner?: OwnerType;
}) => {
  const { open } = useDesc();
  const color = PlanetsData[planet].color;
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md transition-all justify-center"
      onClick={() => open({ type: "planet", value: planet, owner })}
      style={{
        backgroundColor: `${color}11`, // color with low opacity
        borderColor: `${color}55`,
      }}
    >
      <span className="text-base">{PlanetsData[planet].glyph}</span>
      <span className="capitalize">{planet}</span>
    </div>
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
    <span className="text-gray-500 text-xs uppercase tracking-wide">
      {title}
    </span>

    <div className="flex flex-wrap gap-1">
      {planets.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        planets.map((planet) => (
          <PlanetChip key={planet} planet={planet} owner={owner} />
        ))
      )}
    </div>
  </div>
);
