import { useDesc } from "../../contexts/DescContext";
import {
  PLANET_ORDER,
  PlanetsData,
  type PlanetBase,
  type PlanetName,
} from "../../types/planet";
import { AspectData, type AspectDisplay } from "../../types/aspect";
import { SignCircle } from "./SignChip";
import type { KeyAngleDisplay } from "../../types/cusp";

export const AspectChip = ({
  aspect,
  showSign = false,
}: {
  aspect: AspectDisplay;
  showSign?: boolean;
}) => {
  const { open } = useDesc();
  const { color, glyph: aspectGylph } = AspectData[aspect.type];

  const isPlanet = (p: PlanetBase | KeyAngleDisplay) => {
    return PLANET_ORDER.includes(p.name as any);
  };

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "aspect", value: aspect })}
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}55`,
      }}
    >
      {showSign && <SignCircle sign={aspect.planet1.sign} />}

      {isPlanet(aspect.planet1) ? (
        <div className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.planet1.name as PlanetName].glyph}
          </span>
          <span className="capitalize text-xs">{aspect.planet1.name}</span>
        </div>
      ) : (
        <span className="inline-block font-mono tracking-tight">
          <span className="text-base capitalize">
            {aspect.planet1.name.charAt(0)}
          </span>
          <span className="relative -top-1 text-xs">
            {aspect.planet1.name.slice(1)}
          </span>
        </span>
      )}

      <span className="text-base">{aspectGylph}</span>

      {isPlanet(aspect.planet2) ? (
        <div className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.planet2.name as PlanetName].glyph}
          </span>
          <span className="capitalize">{aspect.planet2.name}</span>
        </div>
      ) : (
        <span className="inline-block font-mono font-semibold tracking-tight">
          <span className="text-base capitalize">
            {aspect.planet2.name.charAt(0)}
          </span>
          <span className="relative -top-1 text-xs">
            {aspect.planet2.name.slice(1)}
          </span>
        </span>
      )}

      {showSign && <SignCircle sign={aspect.planet2.sign} />}
      {aspect.orb && (
        <span className="text-gray-500 text-[10px] ml-1">{aspect.orb}°</span>
      )}
    </div>
  );
};
