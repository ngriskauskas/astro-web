import { AspectData, type Aspect } from "../../types/aspect";
import { PlanetsData } from "../../types/planet";
import { BackButton, CloseButton, Section } from "./Helpers";

export const AspectPanel = ({ aspect }: { aspect: Aspect }) => {
  const aspectInfo = AspectData[aspect.type];
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: aspectInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <span className="text-xl">
            {PlanetsData[aspect.planet1.name].glyph}
          </span>
          <span className="capitalize">{aspect.planet1.name}</span>
          <span className="text-xl">{aspectInfo.glyph}</span>
          <span className="text-xl">
            {PlanetsData[aspect.planet2.name].glyph}
          </span>

          <span className="capitalize">{aspect.planet2.name}</span>
        </h2>
        <CloseButton />
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{aspectInfo.glyph}</span>
            <span className="font-semibold">{aspectInfo.name}</span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {aspectInfo.description}
          </div>
        </Section>
      </div>
    </div>
  );
};
