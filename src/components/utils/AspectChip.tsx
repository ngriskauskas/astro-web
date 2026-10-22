import { useDesc } from "../../contexts/DescContext";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { AspectData, type AspectDisplay } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { aspectName } from "../../utils/aspectName";
import { SignCircle } from "./SignChip";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "./chipStyles";

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
  const info = AspectData[aspect.type];

  const content = (
    <>
      {showSign && <SignCircle sign={aspect.point1.value.sign} />}
      <Point point={aspect.point1} showName={showPlanetName} />
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs leading-none"
        style={{ backgroundColor: `${info.color}33`, color: info.color }}
      >
        {info.glyph}
      </span>
      <Point point={aspect.point2} showName={showPlanetName} />
      {showSign && <SignCircle sign={aspect.point2.value.sign} />}
      {aspect.orb && (
        <span className="ml-0.5 text-[10px] font-normal tabular-nums text-gray-600">
          {aspect.orb.toFixed(2)}°
        </span>
      )}
    </>
  );

  const style = chipTint(info.color);

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
      aria-label={aspectName(aspect)}
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE}`}
      onClick={() => open({ type: "aspect", value: aspect })}
      style={style}
    >
      {content}
    </button>
  );
};

// One end of the aspect: a planet's glyph, or an angle's letters. Angles keep their
// letters in the chip and name themselves for screen readers through the chip label.
const Point = ({
  point,
  showName,
}: {
  point: AspectDisplay["point1"];
  showName: boolean;
}) => {
  if (point.type === "Planet") {
    const planet = PlanetsData[point.value.name as PlanetName];
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-sm leading-none" aria-hidden="true">
          {planet.glyph}
        </span>
        {showName && <span>{planet.displayName}</span>}
      </span>
    );
  }

  const angle = AngleData[point.value.name];
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono font-semibold tracking-tight">{point.value.name}</span>
      {showName && <span className="text-gray-600">{angle.name}</span>}
    </span>
  );
};
