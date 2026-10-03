import { useState } from "react";
import { useCurrentTimings } from "../../hooks/timings/useTimings";
import { WeeklyPlanetaryTimeline } from "./WeeklyPlanetaryTimeline";
import { WeeklyPlanetaryTimings } from "./WeeklyPlanetaryTimings";

type WeeklyTimingView = "grouped" | "timeline";

export const WeeklyTimingWidget = () => {
  const [view, setView] = useState<WeeklyTimingView>("grouped");
  const timingResult = useCurrentTimings({ filterKeyAngleAspects: true });

  return (
    <section aria-labelledby="weekly-heading" className="border-t border-gray-200 py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="weekly-heading" className="text-lg font-semibold text-gray-900">
          Weekly Timings
        </h2>
        <div
          className="inline-flex rounded-md border border-gray-300 bg-white p-0.5"
          role="group"
          aria-label="Weekly timing view"
        >
          <button
            type="button"
            aria-pressed={view === "grouped"}
            onClick={() => setView("grouped")}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "grouped" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            By day
          </button>
          <button
            type="button"
            aria-pressed={view === "timeline"}
            onClick={() => setView("timeline")}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "timeline" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>
      {view === "grouped" ? (
        <WeeklyPlanetaryTimings {...timingResult} embedded />
      ) : (
        <WeeklyPlanetaryTimeline {...timingResult} embedded />
      )}
    </section>
  );
};
