import { useDesc } from "../../contexts/DescContext";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { AspectData, type AspectDisplay } from "../../types/aspect";
import { SignCircle } from "./SignChip";

export const AspectChip = ({
  aspect,
  showSign = false,
  showPlanetName = true,
}: {
  aspect: AspectDisplay;
  showSign?: boolean;
  showPlanetName?: boolean;
}) => {
  const { open } = useDesc();
  const { color, glyph: aspectGylph } = AspectData[aspect.type];

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "aspect", value: aspect })}
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}55`,
      }}
    >
      {showSign && <SignCircle sign={aspect.point1.value.sign} />}

      {aspect.point1.type === "Planet" ? (
        <div className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.point1.value.name as PlanetName].glyph}
          </span>
          {showPlanetName && (
            <span className="text-xs">
              {PlanetsData[aspect.point1.value.name as PlanetName].displayName}
            </span>
          )}
        </div>
      ) : (
        <span className="inline-block font-mono tracking-tight">
          <span className="text-base capitalize">{aspect.point1.value.name.charAt(0)}</span>
          {showPlanetName && (
            <span className="relative -top-1 text-xs">{aspect.point1.value.name.slice(1)}</span>
          )}
        </span>
      )}

      <span className="text-base">{aspectGylph}</span>

      {aspect.point2.type === "Planet" ? (
        <div className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.point2.value.name as PlanetName].glyph}
          </span>
          {showPlanetName && (
            <span>{PlanetsData[aspect.point2.value.name as PlanetName].displayName}</span>
          )}
        </div>
      ) : (
        <span className="inline-block font-mono font-semibold tracking-tight">
          <span className="text-base capitalize">{aspect.point2.value.name.charAt(0)}</span>
          {showPlanetName && (
            <span className="relative -top-1 text-xs">{aspect.point2.value.name.slice(1)}</span>
          )}
        </span>
      )}

      {showSign && <SignCircle sign={aspect.point2.value.sign} />}
      {aspect.orb && (
        <span className="text-gray-500 text-[10px] ml-1">{aspect.orb.toFixed(2)}°</span>
      )}
    </div>
  );
};
