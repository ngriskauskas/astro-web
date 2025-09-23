import type { AspectTiming } from "../../../hooks/timings/useTimings";
import { AspectChip, DateChip, SectionSmall } from "../../descriptions/Helpers";

import { useState } from "react";

import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import type { TimingEvent } from "../CurrentTimings";
import { useWheel } from "../../../hooks/useWheel";
import { useAspectDesc } from "../../../hooks/useDescData";

export const AspectTimingCard = ({ event }: { event: TimingEvent }) => {
  const aspect = event.data as AspectTiming;
  const [expanded, setExpanded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const ranges = aspect.exact_date_ranges || [];
  const hasMultipleRanges = ranges.length > 1;
  const displayedRanges = expanded ? ranges : ranges.slice(0, 1);

  const { loading, aspectDesc } = useAspectDesc(
    {
      aspect: aspect.aspect_type,
      planet1: aspect.planet1,
      planet2: aspect.planet2,
    },
    descOpen,
  );

  const eventLabel =
    event.event === "start"
      ? "starts"
      : event.event === "end"
        ? "ends"
        : "exact";

  const dateToShow =
    event.event === "start"
      ? aspect.start_date
      : event.event === "end"
        ? aspect.end_date
        : event.date;

  const { type } = useWheel();

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 space-y-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <AspectChip
            aspect={{
              type: aspect.aspect_type,
              planet1: aspect.planet1,
              planet2: aspect.planet2,
              planet1Owner: type === "transit" ? "main" : undefined,
            }}
          />
          <span className="text-sm font-semibold tracking-wide text-gray-500">
            {eventLabel}
          </span>
        </div>
        <DateChip date={dateToShow} format />
      </div>
      <SectionSmall title="Dates" startOpen={false}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold w-[80px]">Date Range:</span>
          <DateChip date={aspect.start_date} />
          <span>→</span>
          <DateChip date={aspect.end_date} />
        </div>
        {ranges.length > 0 && (
          <div className="flex gap-2 mt-1 items-center">
            <span className="font-semibold w-[80px] shrink-0 text-xs text-gray-500">
              Exact Dates:
            </span>
            <div className="flex flex-wrap gap-2 flex-1 text-xs text-gray-500">
              {displayedRanges.map(([start, end], i) =>
                start === end ? (
                  <DateChip key={i} date={start} />
                ) : (
                  <div key={i} className="flex items-center gap-2">
                    <DateChip date={start} />
                    <span>→</span>
                    <DateChip date={end} />
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
      </SectionSmall>
      <SectionSmall
        title="Description"
        startOpen={false}
        loading={loading}
        onOpen={() => setDescOpen(true)}
      >
        {!loading && aspectDesc?.description}
      </SectionSmall>
    </div>
  );
};
