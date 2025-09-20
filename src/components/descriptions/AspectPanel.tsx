import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useAspectDesc } from "../../hooks/useDescData";
import { useWheel } from "../../hooks/useWheel";
import { AspectData, type AspectDisplay } from "../../types/aspect";
import { PlanetsData } from "../../types/planet";
import { BackButton, CloseButton, PlanetChip, Section } from "./Helpers";

export const AspectPanel = ({ aspect }: { aspect: AspectDisplay }) => {
  const aspectInfo = AspectData[aspect.type];
  const { loading, aspectDesc } = useAspectDesc({
    aspect: aspect.type,
    planet1: aspect.planet1,
    planet2: aspect.planet2,
  });

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
  const isMulti = type === "transit" || type === "synastry";

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: aspectInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <span className="text-xl">{PlanetsData[aspect.planet1].glyph}</span>
          <span className="capitalize">{aspect.planet1}</span>
          <span className="text-xl">{aspectInfo.glyph}</span>
          <span className="text-xl">{PlanetsData[aspect.planet2].glyph}</span>

          <span className="capitalize">{aspect.planet2}</span>
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
        <Section title="Details" loading={loading}>
          {aspect.orb && (
            <div className="mb-2">
              <span className="font-small">Orb: </span>
              {aspect.orb.toFixed(2)}°
            </div>
          )}
          {isMulti ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide mb-1 text-center">
                  {aspect.planet1Owner === "other"
                    ? `${otherProfileName}'s`
                    : "Yours"}
                </span>
                <PlanetChip planet={aspect.planet1} />
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide mb-1 text-center">
                  {aspect.planet1Owner === "main"
                    ? `${otherProfileName}'s`
                    : "Yours"}
                </span>

                <PlanetChip planet={aspect.planet2} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <PlanetChip planet={aspect.planet1} />
              <PlanetChip planet={aspect.planet2} />
            </div>
          )}
          {aspectDesc && (
            <div className="text-xs text-gray-600 mt-2 pl-2">
              {aspectDesc.description}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};
