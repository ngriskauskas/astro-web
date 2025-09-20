import type { RetrogradeTiming } from "../../../hooks/timings/getTimings";
import { DateChip, PlanetChip } from "../../descriptions/Helpers";

export const RetrogradeTimingCard = ({
  retrograde,
}: {
  retrograde: RetrogradeTiming;
}) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Retrograde
      </h3>
      <div className="mb-2 inline-block">
        <PlanetChip planet={retrograde.planet} />
      </div>
      <div className="flex items-center gap-2">
        <DateChip date={retrograde.start_date} />
        <span className="text-gray-400">→</span>
        <DateChip date={retrograde.end_date} />
      </div>
    </div>
  );
};
