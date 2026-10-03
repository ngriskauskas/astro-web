import { BackButton, CloseButton } from "./Helpers";
import { LoadError } from "../utils/LoadError";
import { Section } from "../utils/Section";
import { DateTimeChip } from "../utils/DateChip";
import type { TimingEvent } from "../../types/timings";
import { useDesc } from "../../contexts/DescContext";
import { PlanetChip } from "../utils/PlanetChip";
import { useRetrogradeDesc } from "../../hooks/descriptions/useRetrogradeDesc";
import { PlanetsData } from "../../types/planet";

type RetrogradeEvent = Extract<TimingEvent, { type: "retrograde" }>;

export const RetrogradeTimingPanel = ({ retrograde }: { retrograde: RetrogradeEvent }) => {
  const retroData = retrograde.data;
  const planet = retroData.planet.name;

  const { loading, error, retrogradeDesc } = useRetrogradeDesc({
    planet,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50">
        <BackButton />
        <h2 className="text-xl flex items-center gap-2">
          <span className="text-2xl">{PlanetsData[planet].glyph}</span>
          <span className="font-semibold">{PlanetsData[planet].displayName}</span>
          <span>retrograde</span>
        </h2>
        <CloseButton />
      </div>

      <div className="p-3 flex-1 overflow-y-auto overscroll-contain">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">℞</span>
            <span className="font-semibold">{PlanetsData[planet].displayName} Retrograde</span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm">
            When a planet goes retrograde, it appears to move backward in the sky from Earth's
            perspective. Retrogrades are periods of review, reflection, and reorientation related to
            the planet's themes.
          </div>
        </Section>

        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">Start:</span>
              <DateTimeChip datetime={retroData.startPlanet.dateTime} format />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">End:</span>
              <DateTimeChip datetime={retroData.endPlanet.dateTime} format />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          {error && <LoadError message="Could not load this description." />}
          {retrogradeDesc && (
            <div className="text-sm text-gray-600 mt-2 pl-2">{retrogradeDesc.description}</div>
          )}
        </Section>
      </div>
    </div>
  );
};

export const RetrogradePreview = ({ retrograde }: { retrograde: RetrogradeEvent }) => {
  const retroData = retrograde.data;
  const { open } = useDesc();

  return (
    <button
      type="button"
      aria-label={`${PlanetsData[retroData.planet.name].displayName} ${retrograde.event === "start" ? "starts" : "ends"} retrograde`}
      className="flex items-center gap-1 px-1 py-1 rounded-md border bg-white shadow-sm cursor-pointer"
      onClick={() => open({ type: "retrogradeTiming", value: retrograde })}
    >
      <PlanetChip planet={retroData.planet.name} interactive={false} />
      <span className="text-sm font-semibold">℞</span>
    </button>
  );
};
