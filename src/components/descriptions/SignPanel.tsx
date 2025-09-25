import { ZodiacData } from "../../types/zodiac";
import {
  BackButton,
  CloseButton,
  DescSection,
  HouseChip,
  OverviewCard,
  PlanetChip,
  PlanetGroup,
  Section,
} from "./Helpers";
import { type ZodiacSign } from "../../types/zodiac";
import { useDesc } from "../../contexts/DescContext";
import { useSignData } from "../../hooks/chart/useChartData";
import { useSignDesc } from "../../hooks/useDescData";
import { useProfileNames } from "../../hooks/chart/getNames";

export const SignPanel = ({ sign }: { sign: ZodiacSign }) => {
  const { open } = useDesc();
  const signInfo = ZodiacData[sign];
  const { info } = signInfo;

  const {
    planets,
    mainPlanets,
    otherPlanets,
    houses,
    mainHouses,
    otherHouses,
  } = useSignData(sign);

  const { loading, signDesc } = useSignDesc({
    sign,
    planets,
    mainPlanets,
    otherPlanets,
    houses,
    mainHouses,
    otherHouses,
  });

  const { otherProfileName } = useProfileNames();

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: signInfo.color }}
      >
        <BackButton />
        <img src={signInfo.glyph} alt={sign} width={32} height={32} />
        <h2 className="text-xl font-semibold capitalize">{sign}</h2>
        <img src={signInfo.drawing} alt={sign} width={32} height={32} />
        <CloseButton />
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {signInfo.info.description}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OverviewCard
              title="Element"
              glyph={info.element.glyph}
              value={info.element.name}
            />
            <OverviewCard
              title="Modality"
              glyph={info.modality.glyph}
              value={info.modality.name}
            />
            <OverviewCard
              title="Polarity"
              glyph={<span className="text-xs">{info.polarity.glyph}</span>}
              value={info.polarity.name}
            />
            <OverviewCard
              title="House"
              value={info.house}
              onClick={() =>
                open({
                  type: "house",
                  value: info.house,
                  owner: mainPlanets ? "main" : undefined,
                })
              }
            />
          </div>
          <div className="mt-3 space-y-2">
            <PlanetGroup
              title="Rulers"
              planets={info.rulers}
              owner={mainPlanets ? "main" : undefined}
            />
            <PlanetGroup
              title="Exalted"
              planets={info.exalted}
              owner={mainPlanets ? "main" : undefined}
            />
            <PlanetGroup
              title="Detriment"
              planets={info.detriment}
              owner={mainPlanets ? "main" : undefined}
            />
            <PlanetGroup
              title="Fall"
              planets={info.fall}
              owner={mainPlanets ? "main" : undefined}
            />
          </div>
        </Section>
        <Section title="Planets in this Sign" loading={loading}>
          <div className="flex flex-col gap-2 w-full">
            {planets &&
              (planets.length === 0 ? (
                <span className="text-gray-500">—</span>
              ) : (
                planets.map(({ name }) => (
                  <DescSection key={name} desc={signDesc?.planets![name] ?? ""}>
                    <PlanetChip planet={name} />
                  </DescSection>
                ))
              ))}

            {mainPlanets && otherPlanets && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    Your planets
                  </span>
                  <div className="flex flex-col gap-2 w-full">
                    {mainPlanets.length === 0 ? (
                      <span>—</span>
                    ) : (
                      mainPlanets.map(({ name }) => (
                        <DescSection
                          key={name}
                          desc={signDesc?.mainPlanets![name] ?? ""}
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
                      <span>—</span>
                    ) : (
                      otherPlanets.map(({ name }) => (
                        <DescSection
                          key={name}
                          desc={signDesc?.otherPlanets![name] ?? ""}
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
        <Section title="Houses in this Sign" loading={loading}>
          <div className="flex flex-col gap-2 w-full">
            {houses &&
              houses.map(({ name }) => (
                <DescSection key={name} desc={signDesc?.houses![name] ?? ""}>
                  <HouseChip house={name} />
                </DescSection>
              ))}

            {mainHouses && otherHouses && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    Your Houses
                  </span>
                  <div className="flex flex-col gap-2 w-full">
                    {mainHouses.map(({ name }) => (
                      <DescSection
                        key={name}
                        desc={signDesc?.mainHouses![name] ?? ""}
                      >
                        <HouseChip house={name} owner="main" />
                      </DescSection>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    {`${otherProfileName} Houses`}
                  </span>
                  <div className="flex flex-col gap-2 w-full">
                    {otherHouses.map(({ name }) => (
                      <DescSection
                        key={name}
                        desc={signDesc?.otherHouses![name] ?? ""}
                      >
                        <HouseChip house={name} owner="other" />
                      </DescSection>
                    ))}
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
