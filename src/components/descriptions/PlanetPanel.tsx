import type { OwnerType } from "../../contexts/MultiWheelContext";
import { usePlanetData } from "../../hooks/chart/useChartData";
import { usePlanetDesc } from "../../hooks/descriptions/usePlanetDesc";
import type { Aspect } from "../../types/aspect";
import { type PlanetName, PlanetsData } from "../../types/planet";
import { formatDegMin } from "../../utils/funcs";
import { AspectChip } from "../utils/AspectChip";
import { HouseChip } from "../utils/HouseChip";
import { Section, DescSection } from "../utils/Section";
import { SignGroup, SignChip } from "../utils/SignChip";
import { BackButton, CloseButton } from "./Helpers";

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
                {formatDegMin(planet.deg_min)}
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
                  <AspectChip
                    aspect={{
                      type: aspect.type,
                      orb: aspect.orb,
                      planet1: aspect.planet1,
                      planet2: aspect.planet2,
                      planet1Owner: aspect.planet1Owner,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
