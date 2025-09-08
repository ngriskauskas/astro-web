import { BackButton, CloseButton, Section, SignGroup } from "./Helpers";
import { PlanetsData, type PlanetName } from "../../types/planet";

export const PlanetPanel = ({
  planet,
  desc,
}: {
  planet: PlanetName;
  desc: string;
}) => {
  const planetInfo = PlanetsData[planet];
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: planetInfo.color }}
      >
        <BackButton />
        <span className="text-2xl">{planetInfo.glyph}</span>
        <h2 className="text-xl font-semibold capitalize">{planet}</h2>
        <CloseButton />
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {planetInfo.info.description}
          </div>
          <div className="mt-3 space-y-2">
            <SignGroup title="Rulerships" signs={planetInfo.info.rulerships} />
            <SignGroup title="Exalted in" signs={planetInfo.info.exaltedIn} />
            <SignGroup title="Detriment in" signs={planetInfo.info.detrimentIn} />
            <SignGroup title="Fall in" signs={planetInfo.info.fallIn} />
          </div>
        </Section>
      </div>
    </div>
  );
};
