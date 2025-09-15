import { useState } from "react";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData } from "../../types/aspect";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";
import { useProfileNames } from "../../hooks/chart/getNames";

export const MultiAspectMatrix = () => {
  const [hoveredRowPlanet, setHoveredRowPlanet] = useState<string | null>(null);
  const [hoveredColPlanet, setHoveredColPlanet] = useState<string | null>(null);
  const { open } = useDesc();

  const sortByPlanetOrder = (arr: Planet[]) =>
    [...arr].sort(
      (a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name),
    );

  const { mainPlanetAngles, otherPlanetAngles } =
    useWheel() as MultiWheelContextType;

  const mainPlanets = sortByPlanetOrder(mainPlanetAngles);
  const otherPlanets = sortByPlanetOrder(otherPlanetAngles);

  const aspects = useWheelData().getFilteredAspects();
  const { mainProfileName, otherProfileName } = useProfileNames();

  return (
    <div className="overflow-x-auto">
      <div className="relative flex items-center">
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-20 text-right font-semibold whitespace-nowrap rotate-[-90deg]">
          {`${otherProfileName} Planets`}
        </div>
        <div className="ml-11">
          <div className="text-center font-semibold mb-1">
            {`${mainProfileName} Planets`}
          </div>
          <table className="table-fixed border border-gray-300 rounded-lg shadow-md overflow-hidden text-center">
            <thead className="bg-gray-100 text-sm font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300"></th>
                {mainPlanets.map((p) => (
                  <th
                    key={p.name}
                    className={`px-4 py-2 text-xl border border-gray-300 cursor-pointer transition-colors ${hoveredColPlanet === p.name ? "bg-yellow-100" : ""
                      }`}
                    onMouseEnter={() => setHoveredColPlanet(p.name)}
                    onMouseLeave={() => setHoveredColPlanet(null)}
                  >
                    {PlanetsData[p.name].glyph}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {otherPlanets.map((rowPlanet) => (
                <tr
                  key={rowPlanet.name}
                  className={`text-sm transition-colors ${hoveredRowPlanet === rowPlanet.name ? "bg-yellow-50" : ""
                    }`}
                >
                  <td
                    className={`px-4 py-2 text-xl font-semibold border border-gray-300 bg-gray-50 cursor-pointer transition-colors ${hoveredRowPlanet === rowPlanet.name ? "bg-yellow-100" : ""
                      }`}
                    onMouseEnter={() => setHoveredRowPlanet(rowPlanet.name)}
                    onMouseLeave={() => setHoveredRowPlanet(null)}
                  >
                    {PlanetsData[rowPlanet.name].glyph}
                  </td>

                  {mainPlanets.map((colPlanet) => {
                    const aspect = aspects.find(
                      (a) =>
                        a.planet1.name === colPlanet.name &&
                        a.planet2.name === rowPlanet.name,
                    );
                    const color = aspect
                      ? AspectData[aspect.type].color
                      : undefined;

                    return (
                      <td
                        key={colPlanet.name}
                        className={`px-4 py-2 text-lg font-bold border border-gray-300 transition-all ${aspect ? "cursor-pointer" : ""
                          } ${hoveredRowPlanet === rowPlanet.name ||
                            hoveredColPlanet === colPlanet.name
                            ? "ring-2 ring-yellow-300"
                            : ""
                          }`}
                        style={{
                          backgroundColor: color ? `${color}20` : undefined,
                          color: color ?? undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (aspect) {
                            e.currentTarget.style.backgroundColor = color
                              ? `${color}40`
                              : "";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (aspect) {
                            e.currentTarget.style.backgroundColor = color
                              ? `${color}20`
                              : "";
                          }
                        }}
                        onClick={() => {
                          if (aspect) {
                            open({ type: "aspect", value: aspect });
                          }
                        }}
                        title={aspect ? AspectData[aspect.type].name : ""}
                      >
                        {aspect ? AspectData[aspect.type].glyph : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
