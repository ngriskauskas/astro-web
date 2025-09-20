import { Link } from "react-router-dom";
import type { AspectTiming } from "../../../hooks/timings/getTimings";
import { AspectChip, DateChip } from "../../descriptions/Helpers";

import { useState } from "react";

import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export const AspectTimingCard = ({ aspect }: { aspect: AspectTiming }) => {
  const [expanded, setExpanded] = useState(false);

  const ranges = aspect.exact_date_ranges || [];
  const hasMultipleRanges = ranges.length > 1;
  const displayedRanges = expanded ? ranges : ranges.slice(0, 1);

  return (
    <div className="rounded-xl border bg-white shadow-sm p-2 ">
      {/* Header */}
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Aspect
      </h3>
      {/* Columns */}
      <div className="flex flex-row justify-between mr-1">
        {/* Left: AspectChip */}
        <div>
          <div className="inline-block">
            <AspectChip
              aspect={{
                type: aspect.aspect_type,
                planet1: aspect.planet1,
                planet2: aspect.planet2,
              }}
            />
          </div>
        </div>

        {/* Right: Dates */}
        <div className="w-[180px] flex-shrink-0 flex flex-col gap-2 text-xs">
          {/* Start / End */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <DateChip date={aspect.start_date} />
              <span>→</span>
              <DateChip date={aspect.end_date} />
            </div>
          </div>
          {/* Exact Dates */}
          {ranges.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center justify-between w-full text-left ${
                  hasMultipleRanges ? "cursor-pointer " : ""
                }`}
              >
                <span className="font-semibold text-gray-500 text-xs">
                  Exact Dates
                </span>
                {hasMultipleRanges && (
                  <span>
                    {expanded ? (
                      <FiChevronUp size={14} />
                    ) : (
                      <FiChevronDown size={14} />
                    )}
                  </span>
                )}
              </button>

              <div
                className={`flex flex-wrap gap-2 transition-all duration-200 ${
                  expanded ? "max-h-full" : "max-h-[2.5rem] "
                }`}
              >
                {displayedRanges.map(([start, end], i) =>
                  start === end ? (
                    <div key={i} className="flex items-center gap-1">
                      <DateChip date={start} />
                    </div>
                  ) : (
                    <div key={i} className="flex items-center gap-1">
                      <DateChip date={start} />
                      <span>→</span>
                      <DateChip date={end} />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
