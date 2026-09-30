import { useDesc } from "../../contexts/DescContext";
import { useStationDesc } from "../../hooks/descriptions/useStationDesc";
import { PlanetsData } from "../../types/planet";
import type { TimingEvent } from "../../types/timings";
import { DateTimeChip } from "../utils/DateChip";
import { PlanetChip } from "../utils/PlanetChip";
import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";

type StationEvent = Extract<TimingEvent, { type: "station" }>;

export const StationTimingPanel = ({ station }: { station: StationEvent }) => {
  const planet = station.data.planet.name;
  const retrograde = station.data.exactStationPlanet.planet.retrograde;
  const { loading, description } = useStationDesc({ planet, retrograde });
  const action = retrograde ? "turns retrograde" : "turns direct";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-amber-50 p-4">
        <BackButton />
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span className="text-2xl">{PlanetsData[planet].glyph}</span>
          <span>
            {PlanetsData[planet].displayName} {action}
          </span>
        </h2>
        <CloseButton />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Section title="Time">
          <div className="flex items-center gap-2">
            <span className="font-medium">Exact</span>
            <DateTimeChip datetime={station.data.exactStationPlanet.dateTime} format />
          </div>
        </Section>
        <Section title="Details" loading={loading}>
          <div className="flex items-center gap-2">
            <PlanetChip planet={planet} />
            <span className="text-sm text-gray-600">{action}</span>
          </div>
          {description && <p className="mt-3 text-sm text-gray-600">{description}</p>}
        </Section>
      </div>
    </div>
  );
};

export const StationPreview = ({ station }: { station: StationEvent }) => {
  const { open } = useDesc();
  const planet = station.data.planet.name;
  const retrograde = station.data.exactStationPlanet.planet.retrograde;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm hover:border-amber-400"
      onClick={() => open({ type: "stationTiming", value: station })}
      aria-label={`${PlanetsData[planet].displayName} stations ${retrograde ? "retrograde" : "direct"}`}
    >
      <span className="text-base" aria-hidden="true">
        {PlanetsData[planet].glyph}
      </span>
      <span>{retrograde ? "stations retrograde" : "stations direct"}</span>
    </button>
  );
};
