/* Temporarily disabled until planet-specific timing responses are documented.
import { useState } from "react";
import { useRetrogradeDesc } from "../../../hooks/descriptions/useRetrogradeDesc";
import type {
  TimingEvent,
  RetrogradeTiming,
} from "../../../hooks/timings/useTimings";
import { DateChip } from "../../utils/DateChip";
import { PlanetChip } from "../../utils/PlanetChip";
import { SectionSmall } from "../../utils/Section";

export const RetrogradeTimingCard = ({ event }: { event: TimingEvent }) => {
  const retrograde = event.data as RetrogradeTiming;
  const [descOpen, setDescOpen] = useState(false);

  const { loading, retrogradeDesc } = useRetrogradeDesc(
    { planet: retrograde.planet },
    descOpen,
  );

  const eventLabel =
    event.event === "start" ? "enters retrograde" : "leaves retrograde";

  const dateToShow =
    event.event === "start" ? retrograde.start_date : retrograde.end_date;

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <PlanetChip planet={retrograde.planet} />
          <span className="text-sm font-semibold tracking-wide text-gray-500">
            {eventLabel}
          </span>
        </div>
        <DateChip date={dateToShow} format />
      </div>
      <SectionSmall title="Dates" startOpen={false}>
        <div className="flex items-center gap-2 text-sm mt-2">
          <DateChip date={retrograde.start_date} />
          <span>→</span>
          <DateChip date={retrograde.end_date} />
        </div>
      </SectionSmall>
      <div className="mb-2"></div>
      <SectionSmall
        title="Description"
        startOpen={false}
        loading={loading}
        onOpen={() => setDescOpen(true)}
      >
        {!loading && retrogradeDesc?.description}
      </SectionSmall>
    </div>
  );
};
*/
