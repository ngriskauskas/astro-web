import { AspectData } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import type { AspectDisplay } from "../../types/aspect";
import { PlanetsData } from "../../types/planet";

export const TimingAspectTitle = ({ aspect }: { aspect: AspectDisplay }) => (
  <span className="flex min-w-0 flex-wrap items-center justify-center gap-2">
    <TimingPointTitle point={aspect.point1} />
    <span className="shrink-0 text-xl" aria-label={AspectData[aspect.type].name}>
      {AspectData[aspect.type].glyph}
    </span>
    <TimingPointTitle point={aspect.point2} />
  </span>
);

const TimingPointTitle = ({ point }: { point: AspectDisplay["point1"] }) => {
  if (point.type === "Angle") {
    return <span className="whitespace-nowrap">{AngleData[point.value.name].name}</span>;
  }

  const planetInfo = PlanetsData[point.value.name];

  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="text-xl">{planetInfo.glyph}</span>
      <span>{planetInfo.displayName}</span>
    </span>
  );
};
