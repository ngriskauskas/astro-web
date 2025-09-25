import type { MoonPhaseTiming } from "../../hooks/timings/useMoonTimings";
import { BackButton, CloseButton, DescSection, Section } from "./Helpers";
import { DateTimeChip, SignChip } from "../descriptions/Helpers";
import { MoonPhasesData } from "../../types/moon";
import { useMoonPhaseDesc } from "../../hooks/useDescData";

export const MoonPhasePanel = ({ phase }: { phase: MoonPhaseTiming }) => {
  const phaseData = MoonPhasesData[phase.phase];

  const { loading, moonPhaseDesc } = useMoonPhaseDesc({
    phase: phase.phase,
    sign: phase.sign,
  });

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: "#f3e8ff" }}
      >
        <BackButton />
        <div className="flex items-center gap-2">
          <span className="text-3xl">{phaseData.glyph}</span>
          <h2 className="text-xl font-semibold capitalize">{phase.phase}</h2>
        </div>
        <CloseButton />
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-3 bg-white border rounded shadow-sm text-sm mb-3">
            {phaseData.info.description}
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Date</span>
              <DateTimeChip datetime={phase.date} format />
            </div>
            <span className="text-gray-500 mb-1">Sign</span>
            <DescSection
              key={phase.sign}
              desc={moonPhaseDesc?.description || ""}
            >
              <SignChip sign={phase.sign} />
            </DescSection>
          </div>
        </Section>
      </div>
    </div>
  );
};
