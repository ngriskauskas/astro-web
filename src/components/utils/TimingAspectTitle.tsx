import { AspectData } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import type { AspectDisplay } from "../../types/aspect";
import { PlanetsData } from "../../types/planet";

// The two ends of an aspect with its symbol between them, as a heading for a timing event.
export const TimingAspectTitle = ({ aspect }: { aspect: AspectDisplay }) => (
  <span className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1">
    <TimingPointTitle point={aspect.point1} />
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base"
      style={{ backgroundColor: `${AspectData[aspect.type].color}22`, color: AspectData[aspect.type].color }}
      aria-label={AspectData[aspect.type].name}
    >
      {AspectData[aspect.type].glyph}
    </span>
    <TimingPointTitle point={aspect.point2} />
  </span>
);

const TimingPointTitle = ({ point }: { point: AspectDisplay["point1"] }) => {
  if (point.type === "Angle") {
    return <span className="whitespace-nowrap font-medium">{AngleData[point.value.name].name}</span>;
  }

  const planetInfo = PlanetsData[point.value.name];

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium">
      <span className="text-lg leading-none" aria-hidden="true">
        {planetInfo.glyph}
      </span>
      <span>{planetInfo.displayName}</span>
    </span>
  );
};
