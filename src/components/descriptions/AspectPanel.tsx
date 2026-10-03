import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { LoadError } from "../utils/LoadError";
import { useAspectDesc } from "../../hooks/descriptions/useAspectDesc";
import { useWheel } from "../../hooks/useWheel";
import {
  type AspectDisplay,
  AspectData,
  AspectMotionData,
  type AspectMotionState,
} from "../../types/aspect";
import type { KeyType } from "../../types/cusp";
import { type PlanetName } from "../../types/planet";
import { KeyAngleChip } from "../utils/KeyAngleChip";
import { PlanetChip } from "../utils/PlanetChip";
import { Section } from "../utils/Section";
import { SignChip } from "../utils/SignChip";
import { BackButton, CloseButton } from "./Helpers";
import { TimingAspectTitle } from "../utils/TimingAspectTitle";

const EXACT_ASPECT_ORB_CUTOFF = 0.25;

export const AspectPanel = ({ aspect }: { aspect: AspectDisplay }) => {
  const aspectInfo = AspectData[aspect.type];
  const motionState: AspectMotionState | undefined = aspect.motion
    ? aspect.orb !== undefined && aspect.orb < EXACT_ASPECT_ORB_CUTOFF
      ? "EXACT"
      : aspect.motion
    : undefined;
  const { loading, error, aspectDesc } = useAspectDesc({
    aspect: aspect.type,
    point1: aspect.point1,
    point2: aspect.point2,
    orb: aspect.orb,
    motion: aspect.motion,
    point1Owner: aspect.point1Owner,
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
  const point1Owner = aspect.point1Owner ?? "main";
  const point2Owner = point1Owner === "main" ? "other" : "main";

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: aspectInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <TimingAspectTitle aspect={aspect} />
        </h2>
        <CloseButton />
      </div>
      <div className="p-3 flex-1 overflow-y-auto overscroll-contain">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{aspectInfo.glyph}</span>
            <span className="font-semibold">{aspectInfo.name}</span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {aspectInfo.description}
          </div>
          {motionState && (
            <>
              <div className="mb-2 font-semibold">{AspectMotionData[motionState].name}</div>
              <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
                {AspectMotionData[motionState].description}
              </div>
            </>
          )}
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
                {point1Owner === "other" ? `${otherProfileName}'s` : `${mainProfileName}'s`}
              </span>
              <span className="text-gray-400 text-xs uppercase tracking-wide text-center">
                {point2Owner === "other" ? `${otherProfileName}'s` : `${mainProfileName}'s`}
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
          {error && <LoadError message="Could not load this description." />}
          {aspectDesc && (
            <div className="text-xs text-gray-600 mt-2 pl-2">{aspectDesc.description}</div>
          )}
        </Section>
      </div>
    </div>
  );
};
