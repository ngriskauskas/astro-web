import { useDesc } from "../../contexts/DescContext";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { useProfileNames } from "../../hooks/chart/getNames";
import { useHouseData } from "../../hooks/chart/useChartData";
import { useHouseDesc } from "../../hooks/descriptions/useHouseDesc";
import { type CuspType, HouseData } from "../../types/cusp";
import { ZodiacData } from "../../types/zodiac";
import { PlanetChip } from "../utils/PlanetChip";
import { Section, DescSection } from "../utils/Section";
import { SignChip } from "../utils/SignChip";
import { BackButton, CloseButton, OverviewCard } from "./Helpers";

export const HousePanel = ({
  houseName,
  owner,
}: {
  houseName: CuspType;
  owner?: OwnerType;
}) => {
  const houseInfo = HouseData[houseName];
  const { open } = useDesc();

  const { house, planets, mainPlanets, otherPlanets, signs } = useHouseData(
    houseName,
    owner,
  );

  const { loading, houseDesc } = useHouseDesc({
    signs,
    planets,
    mainPlanets,
    otherPlanets,
    house,
  });

  const { otherProfileName } = useProfileNames();

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
        <Section title="Planets in this House" loading={loading}>
          <div className="flex flex-wrap gap-1">
            {planets &&
              (planets.length === 0 ? (
                <span className="text-gray-500">—</span>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {planets.map(({ name }) => (
                    <DescSection
                      key={name}
                      desc={houseDesc?.planets![name] ?? ""}
                    >
                      <PlanetChip planet={name} owner={owner} />
                    </DescSection>
                  ))}
                </div>
              ))}

            {mainPlanets && otherPlanets && (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    Your planets
                  </span>
                  <div className="flex flex-col gap-2">
                    {mainPlanets.length === 0 ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      mainPlanets.map(({ name }) => (
                        <DescSection
                          key={name}
                          desc={houseDesc?.mainPlanets![name] ?? ""}
                        >
                          <PlanetChip planet={name} owner="main" />
                        </DescSection>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    {`${otherProfileName} Planets`}
                  </span>
                  <div className="flex flex-col gap-2">
                    {otherPlanets.length === 0 ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      otherPlanets.map(({ name }) => (
                        <DescSection
                          key={name}
                          desc={houseDesc?.otherPlanets![name] ?? ""}
                        >
                          <PlanetChip planet={name} owner="other" />
                        </DescSection>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
        <Section title="Signs in this House" loading={loading}>
          <div className="flex flex-col gap-2 w-full">
            {signs.map(({ sign }) => (
              <DescSection key={sign} desc={houseDesc?.signs[sign] ?? ""}>
                <SignChip sign={sign} />
              </DescSection>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};
