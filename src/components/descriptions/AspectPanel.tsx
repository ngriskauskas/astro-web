import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useAspectDesc } from "../../hooks/descriptions/useAspectDesc";
import { useWheel } from "../../hooks/useWheel";
import { type AspectDisplay, AspectData } from "../../types/aspect";
import type { KeyAngleDisplay, KeyType } from "../../types/cusp";
import { PLANET_ORDER, PlanetsData, type PlanetBase, type PlanetName } from "../../types/planet";
import { KeyAngleChip } from "../utils/KeyAngleChip";
import { PlanetChip } from "../utils/PlanetChip";
import { Section } from "../utils/Section";
import { SignChip } from "../utils/SignChip";
import { BackButton, CloseButton } from "./Helpers";

export const AspectPanel = ({ aspect }: { aspect: AspectDisplay }) => {
  const aspectInfo = AspectData[aspect.type];
  const { loading, aspectDesc } = useAspectDesc({
    aspect: aspect.type,
    point1: aspect.point1,
    point2: aspect.point2,
  });

  const {
    settings: { otherProfileId, profileId },
    type,
  } = useWheel();

  const { profiles, mainProfile } = useBirthProfiles();

  const getProfileName = (id: number | undefined) => {
    if (!id || !profiles) return type === "transit" ? "transit" : "other";
    if (mainProfile && id === mainProfile.id) return "Your";
    return profiles.find((x) => x.id === id)?.name || "other";
  };

  const mainProfileName = getProfileName(profileId);
  const otherProfileName = getProfileName(otherProfileId);

  const isMulti = type === "transit" || type === "synastry";

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: aspectInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          {aspect.point1.type === "Planet" ? (
            <div>
              <span className="text-xl mr-1">
                {PlanetsData[aspect.point1.value.name as PlanetName].glyph}
              </span>
              <span className="capitalize">{aspect.point1.value.name}</span>
            </div>
          ) : (
            <div>
              <span className="inline-block font-mono tracking-tight">
                <span className="capitalize">{aspect.point1.value.name.charAt(0)}</span>
                <span className="relative -top-1 text-xs">{aspect.point1.value.name.slice(1)}</span>
              </span>
            </div>
          )}

          <span className="text-xl">{aspectInfo.glyph}</span>
          {aspect.point2.type === "Planet" ? (
            <div>
              <span className="text-xl mr-1">
                {PlanetsData[aspect.point2.value.name as PlanetName].glyph}
              </span>
              <span className="capitalize">{aspect.point2.value.name}</span>
            </div>
          ) : (
            <div>
              <span className="inline-block font-mono font-semibold tracking-tight">
                <span className="text-base capitalize">{aspect.point2.value.name.charAt(0)}</span>
                <span className="relative -top-1 text-xs">{aspect.point2.value.name.slice(1)}</span>
              </span>
            </div>
          )}
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
            <div className="mb-3">
              <span className="font-small">Orb: </span>
              {aspect.orb.toFixed(2)}°
            </div>
          )}
          {isMulti ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <span className="text-gray-400 text-xs uppercase tracking-wide text-center">
                {aspect.point1Owner === "other" ? `${otherProfileName}'s` : `${mainProfileName}'s`}
              </span>
              <span className="text-gray-400 text-xs uppercase tracking-wide text-center">
                {aspect.point1Owner === "main" ? `${otherProfileName}'s` : `${mainProfileName}'s`}
              </span>
              {aspect.point1.type === "Planet" ? (
                <PlanetChip planet={aspect.point1.value.name as PlanetName} />
              ) : (
                <KeyAngleChip angle={aspect.point1.value.name as KeyType} />
              )}
              {aspect.point2.type === "Planet" ? (
                <PlanetChip planet={aspect.point2.value.name as PlanetName} />
              ) : (
                <KeyAngleChip angle={aspect.point2.value.name as KeyType} />
              )}
              <SignChip sign={aspect.point1.value.sign} />
              <SignChip sign={aspect.point2.value.sign} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {aspect.point1.type === "Planet" ? (
                <PlanetChip planet={aspect.point1.value.name as PlanetName} />
              ) : (
                <KeyAngleChip angle={aspect.point1.value.name as KeyType} />
              )}
              {aspect.point2.type === "Planet" ? (
                <PlanetChip planet={aspect.point2.value.name as PlanetName} />
              ) : (
                <KeyAngleChip angle={aspect.point2.value.name as KeyType} />
              )}
              <SignChip sign={aspect.point1.value.sign} />
              <SignChip sign={aspect.point2.value.sign} />
            </div>
          )}
          {aspectDesc && (
            <div className="text-xs text-gray-600 mt-2 pl-2">{aspectDesc.description}</div>
          )}
        </Section>
      </div>
    </div>
  );
};
