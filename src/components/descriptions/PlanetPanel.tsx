import {
  AspectChip,
  BackButton,
  CloseButton,
  HouseChip,
  Section,
  SignChip,
  SignGroup,
} from "./Helpers";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { useWheel } from "../../hooks/useWheel";

export const PlanetPanel = ({
  planet,
}: {
  planet: PlanetName;
  desc: string;
}) => {
  const { getPlanetAspects, getPlanet, getPlanetHouse } = useWheel();
  const aspects = getPlanetAspects(planet);
  const planetValue = getPlanet(planet);
  const house = getPlanetHouse(planet);
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
            <SignGroup
              title="Detriment in"
              signs={planetInfo.info.detrimentIn}
            />
            <SignGroup title="Fall in" signs={planetInfo.info.fallIn} />
          </div>
        </Section>
        <Section title="Details">
          <div className="flex flex-col gap-3">
            {planetValue.retrograde && (
              <div className="flex flex-col items-start gap-1">
                <span className="text-gray-500 text-sm">Retrograde ℞</span>
              </div>
            )}

            <div className="flex flex-col items-start gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Sign
              </span>
              <div className="flex items-center gap-1">
                <SignChip sign={planetValue.sign} />
                <span className="text-gray-600 text-[13px] ml-1">
                  {`${Math.round(planetValue.deg_min[0])}° ${Math.round(
                    planetValue.deg_min[1],
                  )}′`}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                House
              </span>
              <HouseChip house={house} />
            </div>
          </div>
        </Section>
        <Section title="Aspects">
          <div className="flex flex-col gap-1">
            {aspects.length === 0 ? (
              <span className="text-gray-500">—</span>
            ) : (
              aspects.map((aspect, index) => (
                <div className="self-start">
                  <AspectChip key={index} aspect={aspect} />
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
