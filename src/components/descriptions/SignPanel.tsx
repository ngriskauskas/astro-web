import { ZodiacData } from "../../types/zodiac";
import {
  BackButton,
  CloseButton,
  OverviewCard,
  PlanetChip,
  PlanetGroup,
  Section,
} from "./Helpers";
import { type ZodiacSign } from "../../types/zodiac";
import { useDesc } from "../../contexts/DescContext";
import { useWheel } from "../../hooks/useWheel";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import type { Planet } from "../../types/planet";

export const SignPanel = ({ sign }: { sign: ZodiacSign }) => {
  const { open } = useDesc();
  const { getPlanetsInSign } = useWheel();
  const signInfo = ZodiacData[sign];
  const { info } = signInfo;

  const planetsInSign = getPlanetsInSign(sign);
  const { mainPlanets, otherPlanets, planets } = Array.isArray(planetsInSign[0])
    ? {
        mainPlanets: (planetsInSign as [Planet[], Planet[]])[0],
        otherPlanets: (planetsInSign as [Planet[], Planet[]])[1],
        planets: undefined,
      }
    : {
        planets: planetsInSign as Planet[],
        mainPlanets: undefined,
        otherPlanets: undefined,
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
                  value: String(info.house),
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
        <Section title="Planets in this Sign">
          <div className="flex flex-wrap gap-1">
            {planets &&
              (planets.length === 0 ? (
                <span className="text-gray-500">—</span>
              ) : (
                planets.map(({ name }) => (
                  <PlanetChip
                    key={name}
                    planet={name}
                    owner={mainPlanets ? "main" : undefined}
                  />
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
                        <PlanetChip
                          key={name}
                          planet={name}
                          owner={mainPlanets ? "main" : undefined}
                        />
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
                        <PlanetChip
                          key={name}
                          planet={name}
                          owner={mainPlanets ? "main" : undefined}
                        />
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
