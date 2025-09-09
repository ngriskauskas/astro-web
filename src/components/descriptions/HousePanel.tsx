import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useDesc } from "../../contexts/DescContext";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { HouseData } from "../../types/cusp";
import { ZodiacData } from "../../types/zodiac";
import {
  BackButton,
  CloseButton,
  OverviewCard,
  PlanetChip,
  Section,
} from "./Helpers";

export const HousePanel = ({
  house,
  owner,
}: {
  house: string;
  owner?: "main" | "other";
}) => {
  const houseInfo = HouseData[house];
  const { open } = useDesc();

  const getPlanets = () => {
    if (owner) {
      const { getPlanetsInHouse } = useWheel() as MultiWheelContextType;
      const [mainPlanets, otherPlanets] = getPlanetsInHouse(house, owner);

      return { mainPlanets, otherPlanets };
    } else {
      const { getPlanetsInHouse } = useWheel() as SingleWheelContextType;
      const planets = getPlanetsInHouse(house);
      return { planets };
    }
  };

  const {
    settings: { otherProfileId },
    type,
  } = useWheel();
  const { profiles } = useBirthProfiles();

  const otherProfileName =
    otherProfileId && profiles
      ? profiles.find((x) => x.id === otherProfileId)?.name
      : type === "transit"
        ? "Transit"
        : "Other";

  const planetData = getPlanets();
  const planets = planetData.planets;
  const mainPlanets = planetData.mainPlanets;
  const otherPlanets = planetData.otherPlanets;

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: houseInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize">{houseInfo.name}</h2>
        <CloseButton />
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {houseInfo.info.description}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OverviewCard
              title="Element"
              glyph={houseInfo.info.element.glyph}
              value={houseInfo.info.element.name}
            />
            <OverviewCard
              title="Modality"
              glyph={houseInfo.info.modality.glyph}
              value={houseInfo.info.modality.name}
            />
            <OverviewCard
              title="Polarity"
              glyph={
                <span className="text-xs">{houseInfo.info.polarity.glyph}</span>
              }
              value={houseInfo.info.polarity.name}
            />
            <OverviewCard
              title="Sign"
              value={houseInfo.info.sign}
              glyph={ZodiacData[houseInfo.info.sign].glyph}
              onClick={() => open({ type: "sign", value: houseInfo.info.sign })}
            />
          </div>
        </Section>
        <Section title="Planets in this House">
          <div className="flex flex-wrap gap-1">
            {planets &&
              (planets.length === 0 ? (
                <span className="text-gray-500">—</span>
              ) : (
                planets.map(({ name }) => (
                  <PlanetChip key={name} planet={name} owner={owner} />
                ))
              ))}
            {mainPlanets && otherPlanets && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    Your planets
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {mainPlanets.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      mainPlanets.map(({ name }) => (
                        <PlanetChip key={name} planet={name} owner={owner} />
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    {`${otherProfileName} Planets`}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {otherPlanets.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      otherPlanets.map(({ name }) => (
                        <PlanetChip key={name} planet={name} owner={owner} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
