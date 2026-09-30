import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useProfileNames } from "../../hooks/chart/getNames";
import { useWheel } from "../../hooks/useWheel";
import { formatDegMin } from "../../utils/funcs";
import { HouseChip } from "../utils/HouseChip";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip } from "../utils/SignChip";

export const TransitPlacements = ({ otherLabel = "Transits" }: { otherLabel?: string }) => {
  const { mainPlanetAngles, otherPlanetAngles } = useWheel() as MultiWheelContextType;
  const { mainProfileName, otherProfileName } = useProfileNames();

  return (
    <section className="border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Placements</h2>
      <div className="max-h-[330px] space-y-5 overflow-y-auto">
        <PlacementGroup
          title={mainProfileName ?? "Natal"}
          planets={mainPlanetAngles}
          owner="main"
        />
        <PlacementGroup
          title={otherProfileName ?? otherLabel}
          planets={otherPlanetAngles}
          owner="other"
        />
      </div>
    </section>
  );
};

const PlacementGroup = ({
  title,
  planets,
  owner,
}: {
  title: string;
  planets: MultiWheelContextType["mainPlanetAngles"];
  owner: "main" | "other";
}) => (
  <div>
    <h3 className="mb-2 text-xs font-medium text-gray-500">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] table-fixed border-collapse text-left text-xs">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[23%]" />
          <col className="w-[21%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead>
          <tr className="border-y border-gray-200 bg-gray-50 text-[10px] font-semibold uppercase text-gray-500">
            <th className="px-2 py-2">Planet</th>
            <th className="px-2 py-2">Sign</th>
            <th className="px-2 py-2">House</th>
            <th className="px-2 py-2">Degree</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {planets.map((planet) => (
            <tr key={`${owner}-${planet.name}`} className="hover:bg-gray-50">
              <td className="px-2 py-2 align-middle">
                <PlanetChip planet={planet.name} owner={owner} />
              </td>
              <td className="px-2 py-2 align-middle">
                <SignChip sign={planet.sign} />
              </td>
              <td className="px-2 py-2 align-middle">
                <HouseChip house={planet.house} owner={owner} />
              </td>
              <td className="whitespace-nowrap px-2 py-2 align-middle font-mono text-gray-500">
                {formatDegMin(planet.position.degMin)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
