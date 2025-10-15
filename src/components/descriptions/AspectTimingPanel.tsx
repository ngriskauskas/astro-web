import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { AspectChip } from "../utils/AspectChip";
import { SignChip } from "../utils/SignChip";
import { DateChip, DateTimeChip } from "../utils/DateChip";
import { useDesc } from "../../contexts/DescContext";
import { useAspectDesc } from "../../hooks/descriptions/useAspectDesc";
import type { TimingEvent, AspectTiming } from "../../hooks/timings/useTimings";
import { AspectData } from "../../types/aspect";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { useWheel } from "../../hooks/useWheel";

export const AspectTimingPanel = ({ event }: { event: TimingEvent }) => {
  const aspect = event.data as AspectTiming;
  const [expanded, setExpanded] = useState(false);

  const ranges = aspect.exact_date_ranges || [];
  const hasMultipleRanges = ranges.length > 1;
  const displayedRanges = expanded ? ranges : ranges.slice(0, 1);

  const { loading, aspectDesc } = useAspectDesc({
    aspect: aspect.aspect_type,
    planet1: aspect.planet1,
    planet2: aspect.planet2,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xl mr-1">
              {PlanetsData[aspect.planet1.name as PlanetName].glyph}
            </span>
            <span className="capitalize">{aspect.planet1.name}</span>
          </div>
          <span className="text-xl">
            {AspectData[aspect.aspect_type].glyph}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl mr-1">
              {PlanetsData[aspect.planet2.name as PlanetName].glyph}
            </span>
            <span className="capitalize">{aspect.planet2.name}</span>
          </div>
        </h2>
        <CloseButton />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {AspectData[aspect.aspect_type].glyph}
            </span>
            <span className="font-semibold">
              {AspectData[aspect.aspect_type].name}
            </span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {AspectData[aspect.aspect_type].description}
          </div>
        </Section>
        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold w-[80px] shrink-0 text-xs text-gray-500">
                Start:
              </span>
              <DateChip date={aspect.start_date} format />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-[80px] shrink-0 text-xs text-gray-500">
                End:
              </span>
              <DateChip date={aspect.end_date} format />
            </div>
          </div>

          {ranges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <span className="font-semibold w-[80px] shrink-0 text-xs text-gray-500">
                Exact Dates:
              </span>
              <div className="flex flex-wrap gap-2 flex-1 text-xs text-gray-500">
                {displayedRanges.map(([start, end], i) =>
                  start === end ? (
                    <DateChip key={i} date={start} format />
                  ) : (
                    <div key={i} className="flex items-center gap-2">
                      <DateChip date={start} format />
                      <span>→</span>
                      <DateChip date={end} format />
                    </div>
                  ),
                )}
              </div>
              {hasMultipleRanges && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer"
                >
                  {expanded ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
          )}
        </Section>
        <Section title="Details" loading={loading}>
          <div className="w-fit">
            <AspectChip
              aspect={{ ...aspect, type: aspect.aspect_type }}
              showSign
            />
          </div>
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

export const AspectPreview = ({
  aspect,
  showLabel = true,
}: {
  aspect: TimingEvent;
  showLabel?: boolean;
}) => {
  const { open } = useDesc();

  const data = aspect.data as AspectTiming;
  const { type } = useWheel();

  const eventLabel =
    aspect.event === "start"
      ? "starts"
      : aspect.event === "end"
        ? "ends"
        : "exact";

  return (
    <div
      className="rounded-lg border bg-white shadow-sm p-1 flex flex-col gap-1 min-w-[160px]
                cursor-pointer"
      onClick={() => open({ type: "aspectTiming", value: aspect })}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1">
          <AspectChip
            aspect={{
              type: data.aspect_type,
              planet1: data.planet1,
              planet2: data.planet2,
              planet1Owner: type === "transit" ? "main" : undefined,
            }}
            showSign
            showPlanetName={false}
          />
          {showLabel && (
            <span className="text-xs font-semibold text-gray-500">
              {eventLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
