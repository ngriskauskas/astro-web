import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { formatDegMin } from "../../utils/funcs";
import { HouseChip } from "../utils/HouseChip";
import { LoadError } from "../utils/LoadError";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip } from "../utils/SignChip";

export const PlacementsTable = () => {
  const { planetAngles, status } = useWheel() as SingleWheelContextType;

  if (status === "error") return <LoadError message="Could not load the chart." />;
  if (planetAngles.length === 0) return null;

  return (
    <div className="scroll-hint-x overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <thead>
          <tr className="bg-gray-500/10 text-xs font-bold uppercase tracking-wider text-gray-600">
            <th className="px-2 py-2 text-left sm:px-3">Planet</th>
            <th className="px-2 py-2 text-left sm:px-3">Sign</th>
            <th className="px-2 py-2 text-left sm:px-3">House</th>
            <th className="px-2 py-2 text-left sm:px-3">Degree</th>
          </tr>
        </thead>
        <tbody>
          {planetAngles.map((planet, index) => {
            return (
              <tr
                key={planet.name}
                className={`${index % 2 === 0 ? "" : "bg-gray-500/5"} hover:bg-gray-500/10`}
              >
                <td className="px-2 py-2 align-middle whitespace-nowrap sm:px-3">
                  <div className="w-fit">
                    <PlanetChip planet={planet.name} />
                  </div>
                </td>
                <td className="px-2 py-2 align-middle whitespace-nowrap sm:px-3">
                  <div className="w-fit">
                    <SignChip sign={planet.sign} />
                  </div>
                </td>
                <td className="px-2 py-2 align-middle whitespace-nowrap sm:px-3">
                  <div className="w-fit">
                    <HouseChip house={planet.house} />
                  </div>
                </td>
                <td className="px-2 py-2 align-middle whitespace-nowrap text-xs font-mono sm:px-3">
                  {formatDegMin(planet.position.degMin)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
