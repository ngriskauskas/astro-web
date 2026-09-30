import { MoonPhasesData, type MoonPhaseDescriptionValue } from "../../types/moon";
import { formatDegMin } from "../../utils/funcs";
import { PlanetsData } from "../../types/planet";
import { SignChip } from "../utils/SignChip";
import { DateTimeChip } from "../utils/DateChip";
import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { useMoonPhaseDesc } from "../../hooks/descriptions/useMoonPhaseDesc";

export const MoonPhasePanel = ({ value }: { value: MoonPhaseDescriptionValue }) => {
  const { phase, timing } = value;
  const phaseData = MoonPhasesData[phase];
  const displayName = phase.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const { loading, moonPhaseDesc } = useMoonPhaseDesc({ phase });

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: "#eef5fb" }}
      >
        <BackButton />
        <div className="flex items-center gap-2">
          <span className="text-3xl">{phaseData.glyph}</span>
          <h2 className="text-xl font-semibold">{displayName}</h2>
        </div>
        <CloseButton />
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-3 bg-white border rounded shadow-sm text-sm mb-3">
            {phaseData.info.description}
          </div>
        </Section>
        <Section title="Times">
          {timing ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">Phase</span>
              <DateTimeChip datetime={timing.dateTime} format />
            </div>
          ) : (
            <span className="text-gray-500">Timing unavailable for this phase.</span>
          )}
        </Section>
        <Section title="Details" loading={loading}>
          {timing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {PlanetsData.MOON.glyph}
                </span>
                <span className="font-medium">Moon</span>
                <SignChip sign={timing.planet.sign} />
              </div>
              <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2 text-sm">
                <span className="text-gray-500">Position</span>
                <span>{formatDegMin(timing.planet.position.degMin)}</span>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Placement details are unavailable.</span>
          )}
          {moonPhaseDesc.description && (
            <p className="text-sm text-gray-600 mt-3">{moonPhaseDesc.description}</p>
          )}
        </Section>
      </div>
    </div>
  );
};
