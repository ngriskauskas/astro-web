import {
  AspectChip,
  BackButton,
  CloseButton,
  DescSection,
  HouseChip,
  Section,
  SignChip,
  SignGroup,
} from "./Helpers";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { usePlanetDesc } from "../../hooks/useDescData";
import { usePlanetData } from "../../hooks/chart/useChartData";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { Aspect } from "../../types/aspect";

export const PlanetPanel = ({
  planetName,
  owner,
}: {
  planetName: PlanetName;
  owner?: OwnerType;
}) => {
  const { aspects, planet, house } = usePlanetData(planetName, owner);
  const { loading, planetDesc } = usePlanetDesc({
    planet,
    house,
    sign: planet.sign,
  });
  const planetInfo = PlanetsData[planetName];

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: planetInfo.color }}
      >
        <BackButton />
        <span className="text-2xl">{planetInfo.glyph}</span>
        <h2 className="text-xl font-semibold capitalize">{planetName}</h2>
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
        <Section title="Details" loading={loading}>
          <div className="flex flex-col gap-3">
            {planet.retrograde && (
              <DescSection
                title="Retrograde ℞"
                desc={planetDesc?.retrograde ?? ""}
              />
            )}

            <DescSection title="Sign" desc={planetDesc?.sign ?? ""}>
              <SignChip sign={planet.sign} />
              <span className="text-gray-600 text-[13px] ml-1">
                {`${Math.round(planet.deg_min[0])}° ${Math.round(
                  planet.deg_min[1],
                )}′`}
              </span>
            </DescSection>
            <DescSection title="House" desc={planetDesc?.house ?? ""}>
              <HouseChip house={house} owner={owner} />
            </DescSection>
          </div>
        </Section>
        <Section title="Aspects">
          <div className="flex flex-col gap-1">
            {aspects.length === 0 ? (
              <span className="text-gray-500">—</span>
            ) : (
              aspects.map((aspect: Aspect, index: number) => (
                <div className="self-start" key={index}>
                  <AspectChip aspect={aspect} />
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
