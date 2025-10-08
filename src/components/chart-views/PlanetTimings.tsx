import { useState } from "react";
import { usePlanetTimings } from "../../hooks/timings/usePlanetTimings";
import { convertToEvents } from "../../hooks/timings/useTimings";
import { type PlanetName, PLANET_ORDER, PlanetsData } from "../../types/planet";
import { HouseChip } from "../utils/HouseChip";
import { SectionSmall } from "../utils/Section";
import { SignChip } from "../utils/SignChip";
import { Spinner } from "../utils/Spinner";
import { EventCard } from "./CurrentTimings";
import { CollapsibleSection } from "../utils/CollapsibleSection";

export const PlanetTimings = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetName>("sun");

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <label
          htmlFor="planet-select"
          className="block text-sm font-medium text-gray-700"
        >
          Select Planet
        </label>

        <select
          id="planet-select"
          value={selectedPlanet}
          onChange={(e) => setSelectedPlanet(e.target.value as PlanetName)}
          className="block w-32 p-1.5 border rounded-md bg-white shadow-sm text-gray-900"
        >
          {PLANET_ORDER.map((planet) => (
            <option key={planet} value={planet}>
              {planet.charAt(0).toUpperCase() + planet.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <PlanetTiming planet={selectedPlanet} />
    </div>
  );
};

export const PlanetTiming = ({ planet }: { planet: PlanetName }) => {
  const {
    loading,
    planetData: { sign },
    house,
    planetAspects,
    transitPlanetDesc,
    planetReturns,
  } = usePlanetTimings({ planet });

  if (loading) return <Spinner />;

  const { } = convertToEvents({
    aspects: planetAspects,
    retrogrades: [],
    ingresses: [],
  });
  const planetInfo = PlanetsData[planet];
  return (
    <div className="p-2 border rounded-md shadow-sm bg-white mt-4 space-y-8">
      <div
        className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: planetInfo.color }}
      >
        <span className="text-2xl">{planetInfo.glyph}</span>
        <h2 className="text-xl font-semibold capitalize">{planet}</h2>
      </div>
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 w-16">Sign:</span>
            <SignChip sign={sign} />
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 w-16">House:</span>
            <HouseChip house={house} />
          </div>
        </div>

        <SectionSmall title="Description" startOpen={false}>
          <p className="text-gray-600 text-sm leading-relaxed">
            {transitPlanetDesc?.description || ""}
          </p>
        </SectionSmall>
      </div>
      <CollapsibleSection title="Returns" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planetReturns?.return && (
            <EventCard
              event={{
                date: planetReturns.return.start_date,
                event: "start",
                type: "aspect",
                data: planetReturns.return,
              }}
            />
          )}
          {planetReturns?.opposition && (
            <EventCard
              event={{
                date: planetReturns.opposition.start_date,
                event: "start",
                type: "aspect",
                data: planetReturns.opposition,
              }}
            />
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
