import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import type { CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import { QuadrantData, type QuadrantKey } from "../../types/hemisphere";
import { CORE_PLANETS, quadrantOf } from "../../utils/natalSummary";
import { BirthTimeNotice } from "../utils/BirthTimeNotice";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";
import { HemisphereWheel } from "./HemisphereWheel";

// The ten planets as one circle of quarters. The circle is the whole widget: each quarter shows
// its name, its count and its planets, and opens its own description.
export const HemispheresBoard = () => {
  const { planetAngles, status, timeUnknown } = useWheel() as SingleWheelContextType;
  if (status === "error") return <LoadError message="Could not load the placements." />;
  if (timeUnknown) return <BirthTimeNotice />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  const placements: { planet: PlanetName; house: CuspType }[] = planetAngles
    .filter((planet) => CORE_PLANETS.includes(planet.name))
    .map((planet) => ({ planet: planet.name, house: planet.house }));
  return (
    <div className="flex flex-col gap-4">
      <HemisphereWheel placements={placements} />
      <p className="text-center text-sm text-gray-700">{emphasis(placements)}</p>
    </div>
  );
};

// Quarters in the order the wheel draws them, from the Ascendant round.
const QUARTER_ORDER: readonly { key: QuadrantKey; number: 1 | 2 | 3 | 4 }[] = [
  { key: "personal", number: 1 },
  { key: "private", number: 2 },
  { key: "relational", number: 3 },
  { key: "collective", number: 4 },
];

// The quarter that holds the most planets, in words. A tie names the quarters that share them,
// and an even spread says so.
const emphasis = (placements: { house: CuspType }[]) => {
  const counts = QUARTER_ORDER.map(({ key, number }) => ({
    key,
    count: placements.filter((placement) => quadrantOf(placement.house) === number).length,
  }));
  const most = Math.max(...counts.map((quarter) => quarter.count));
  const leaders = counts.filter((quarter) => quarter.count === most);
  if (leaders.length === QUARTER_ORDER.length) return "Your planets are spread evenly across the four quarters.";
  if (leaders.length > 1) {
    const names = leaders.map((quarter) => QuadrantData[quarter.key].name);
    return `Your planets are shared between the ${names.join(" and ")} quarters.`;
  }
  const [leader] = leaders;
  return `Most of your planets sit in the ${QuadrantData[leader.key].name} quarter, where ${QuadrantData[leader.key].focus}.`;
};
