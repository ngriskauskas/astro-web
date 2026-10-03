import { useDesc } from "../../contexts/DescContext";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { AspectData, type AspectDisplay } from "../../types/aspect";
import { aspectName } from "../../utils/aspectName";
import { SignCircle } from "./SignChip";

const CHIP =
  "flex max-w-full flex-wrap items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm font-medium";

// `interactive={false}` draws the chip without making it a button, for use inside
// something that is already one.
export const AspectChip = ({
  aspect,
  showSign = false,
  showPlanetName = true,
  interactive = true,
}: {
  aspect: AspectDisplay;
  showSign?: boolean;
  showPlanetName?: boolean;
  interactive?: boolean;
}) => {
  const { open } = useDesc();
  const { color, glyph: aspectGylph } = AspectData[aspect.type];

  const style = {
    backgroundColor: `${color}11`,
    borderColor: `${color}55`,
  };
  const content = (
    <>
      {showSign && <SignCircle sign={aspect.point1.value.sign} />}

      {aspect.point1.type === "Planet" ? (
        <span className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.point1.value.name as PlanetName].glyph}
          </span>
          {showPlanetName && (
            <span className="text-xs">
              {PlanetsData[aspect.point1.value.name as PlanetName].displayName}
            </span>
          )}
        </span>
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
        <span className="flex flex-row items-center gap-1 text-xs">
          <span className="text-base">
            {PlanetsData[aspect.point2.value.name as PlanetName].glyph}
          </span>
          {showPlanetName && (
            <span>{PlanetsData[aspect.point2.value.name as PlanetName].displayName}</span>
          )}
        </span>
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
      aria-label={aspectName(aspect)}
      className={`${CHIP} cursor-pointer hover:shadow-md`}
      onClick={() => open({ type: "aspect", value: aspect })}
      style={style}
    >
      {content}
    </button>
  );
};
