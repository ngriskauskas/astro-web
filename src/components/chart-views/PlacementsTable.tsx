import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheelData } from "../../hooks/chart/useWheelData";
import { useWheel } from "../../hooks/useWheel";
import { formatDegMin } from "../../utils/funcs";
import { HouseChip } from "../utils/HouseChip";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip } from "../utils/SignChip";

export const PlacementsTable = () => {
  const { planetAngles } = useWheel() as SingleWheelContextType;

  return (
    <div className="overflow-x-auto ml-4">
      <table className="table-fixed border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
            <th className="w-1/5 px-3 py-2 text-left">Planet</th>
            <th className="w-1/5 px-3 py-2 text-left">Sign</th>
            <th className="w-1/5 px-3 py-2 text-left">House</th>
            <th className="w-1/5 px-3 py-2 text-left ">Degree</th>
          </tr>
        </thead>
        <tbody>
          {planetAngles.map((planet, index) => {
            const { getPlanetHouse } = useWheelData();
            const house = getPlanetHouse(planet.name);

            return (
              <tr
                key={planet.name}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="px-3 py-2 align-middle whitespace-nowrap">
                  <div className="max-w-[100px] ">
                    <PlanetChip planet={planet.name} />
                  </div>
                </td>
                <td className="px-3 py-2 align-middle whitespace-nowrap">
                  <div className="max-w-[100px]">
                    <SignChip sign={planet.sign} />
                  </div>
                </td>
                <td className="px-3 py-2 align-middle whitespace-nowrap">
                  <div className="max-w-[80px]">
                    <HouseChip house={house} />
                  </div>
                </td>
                <td className="px-3 py-2 align-middle text-xs font-mono">
                  {formatDegMin(planet.deg_min)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
