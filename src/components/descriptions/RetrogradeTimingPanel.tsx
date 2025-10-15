import { BackButton, CloseButton } from "./Helpers";
import { Section } from "../utils/Section";
import { DateChip } from "../utils/DateChip";
import type { TimingEvent } from "../../hooks/timings/useTimings";
import type { RetrogradeTiming } from "../../hooks/timings/useTimings";
import { useDesc } from "../../contexts/DescContext";
import { PlanetChip } from "../utils/PlanetChip";
import { useRetrogradeDesc } from "../../hooks/descriptions/useRetrogradeDesc";
import { PlanetsData } from "../../types/planet";

export const RetrogradeTimingPanel = ({
  retrograde,
}: {
  retrograde: TimingEvent;
}) => {
  const retroData = retrograde.data as RetrogradeTiming;

  const { loading, retrogradeDesc } = useRetrogradeDesc({
    planet: retroData.planet,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50">
        <BackButton />
        <h2 className="text-xl flex items-center gap-2">
          <span className="text-2xl">
            {PlanetsData[retroData.planet].glyph}
          </span>
          <h2 className="text-xl font-semibold capitalize">
            {retroData.planet}
          </h2>
          <span>retrograde</span>
        </h2>
        <CloseButton />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">℞</span>
            <span className="font-semibold capitalize">
              {retroData.planet} Retrograde
            </span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm">
            When a planet goes retrograde, it appears to move backward in the
            sky from Earth's perspective. Retrogrades are periods of review,
            reflection, and reorientation related to the planet's themes.
          </div>
        </Section>

        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">
                Start:
              </span>
              <DateChip date={retroData.start_date} format />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">
                End:
              </span>
              <DateChip date={retroData.end_date} format />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          {retrogradeDesc && (
            <div className="text-sm text-gray-600 mt-2 pl-2">
              {retrogradeDesc.description}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export const RetrogradePreview = ({
  retrograde,
}: {
  retrograde: TimingEvent;
}) => {
  const retroData = retrograde.data as RetrogradeTiming;
  const { open } = useDesc();

  return (
    <div
      className="
        flex items-center gap-1 px-1 py-1 rounded-md
        border
        bg-white
        shadow-sm
        cursor-pointer
      "
      onClick={() => open({ type: "retrogradeTiming", value: retrograde })}
    >
      <PlanetChip planet={retroData.planet} />
      <span className="text-sm font-semibold">℞</span>
    </div>
  );
};
