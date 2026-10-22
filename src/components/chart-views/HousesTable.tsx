import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { HouseData } from "../../types/cusp";
import { ZodiacData } from "../../types/zodiac";
import { formatDegMin } from "../../utils/funcs";
import { BirthTimeNotice } from "../utils/BirthTimeNotice";
import { CHIP_BASE, chipTint } from "../utils/chipStyles";
import { LoadError } from "../utils/LoadError";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip } from "../utils/SignChip";
import { Spinner } from "../utils/Spinner";

// Each house: where it starts, the sign it starts in, that sign's ruler, and the planets in it.
// Rows take the sign's colour, so the eye follows the signs round the chart.
export const HousesTable = () => {
  const { cuspAngles, planetAngles, status, timeUnknown } = useWheel() as SingleWheelContextType;
  if (status === "error") return <LoadError message="Could not load the houses." />;
  if (timeUnknown) return <BirthTimeNotice />;
  if (status === "loading" || cuspAngles.length === 0) return <Spinner />;

  const cusps = [...cuspAngles].sort((left, right) => Number(left.name) - Number(right.name));

  return (
    <div className="scroll-hint-x overflow-x-auto">
      <table className="w-full min-w-[34rem] border-separate border-spacing-y-1.5 text-sm">
        <caption className="sr-only">Houses of this chart</caption>
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <th scope="col" className="px-2 pb-1">House</th>
            <th scope="col" className="px-2 pb-1">Starts at</th>
            <th scope="col" className="px-2 pb-1">Ruler</th>
            <th scope="col" className="px-2 pb-1">Planets in house</th>
          </tr>
        </thead>
        <tbody>
          {cusps.map((cusp) => {
            const color = ZodiacData[cusp.sign].color;
            const ruler = ZodiacData[cusp.sign].info.rulers[0];
            const occupants = planetAngles.filter((planet) => planet.house === cusp.name);
            return (
              <tr key={cusp.name} className="transition-colors hover:bg-gray-50">
                <th
                  scope="row"
                  className="rounded-l-xl border-y border-l px-2 py-2 text-left font-medium text-gray-900"
                  style={{ ...chipTint(color), borderLeftWidth: 3 }}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs tabular-nums text-gray-700">
                      {cusp.name}
                    </span>
                    {HouseData[cusp.name].name}
                  </span>
                </th>
                <td className="border-y px-2 py-2" style={chipTint(color)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <SignChip sign={cusp.sign} />
                    <span className="tabular-nums text-gray-600">{formatDegMin(cusp.position.degMin)}</span>
                  </div>
                </td>
                <td className="border-y px-2 py-2" style={chipTint(color)}>
                  {ruler && <PlanetChip planet={ruler} />}
                </td>
                <td className="rounded-r-xl border-y border-r px-2 py-2" style={chipTint(color)}>
                  {occupants.length === 0 ? (
                    <span className={`${CHIP_BASE} border-dashed border-gray-300 bg-transparent text-gray-400`}>Empty</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {occupants.map((planet) => (
                        <PlanetChip key={planet.name} planet={planet.name} />
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
