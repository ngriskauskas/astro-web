import { useState } from "react";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData } from "../../types/aspect";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";

export const AspectMatrix = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const { open } = useDesc();

  const sortByPlanetOrder = (arr: Planet[]) =>
    [...arr].sort(
      (a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name),
    );

  const { planetAngles } = useWheel() as SingleWheelContextType;
  const planets = sortByPlanetOrder(planetAngles);
  const aspects = useWheelData().getFilteredAspects();

  return (
    <div className="overflow-x-auto ml-4">
      <table className="table-fixed border border-gray-300 rounded-lg shadow-md overflow-hidden text-center">
        <thead className="bg-gray-100 text-sm font-semibold">
          <tr>
            <th className="px-4 py-2 border border-gray-300"></th>
            {planets.map((p) => (
              <th
                key={p.name}
                className={`px-4 py-2 text-xl border border-gray-300 cursor-pointer transition-colors ${
                  hoveredPlanet === p.name ? "bg-yellow-100" : ""
                }`}
                onMouseEnter={() => setHoveredPlanet(p.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {PlanetsData[p.name].glyph}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {planets.map((rowPlanet, rowIndex) => (
            <tr
              key={rowPlanet.name}
              className={`text-sm transition-colors ${
                hoveredPlanet === rowPlanet.name ? "bg-yellow-50" : ""
              }`}
            >
              <td
                className={`px-4 py-2 text-xl font-semibold border border-gray-300 bg-gray-50 cursor-pointer transition-colors ${
                  hoveredPlanet === rowPlanet.name ? "bg-yellow-100" : ""
                }`}
                onMouseEnter={() => setHoveredPlanet(rowPlanet.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {PlanetsData[rowPlanet.name].glyph}
              </td>

              {planets.map((colPlanet, colIndex) => {
                if (rowIndex === colIndex) {
                  return (
                    <td
                      key={colPlanet.name}
                      className="px-4 py-2 text-gray-300 border border-gray-300"
                    >
                      –
                    </td>
                  );
                }

                if (colIndex > rowIndex) {
                  return (
                    <td
                      key={colPlanet.name}
                      className="px-4 py-2 border border-gray-200 bg-gray-100"
                      aria-hidden
                    />
                  );
                }

                const aspect = aspects.find(
                  (a) =>
                    (a.planet1.name === rowPlanet.name &&
                      a.planet2.name === colPlanet.name) ||
                    (a.planet1.name === colPlanet.name &&
                      a.planet2.name === rowPlanet.name),
                );

                const color = aspect
                  ? AspectData[aspect.type].color
                  : undefined;

                return (
                  <td
                    key={colPlanet.name}
                    className={`px-4 py-2 text-lg font-bold border border-gray-300 transition-all ${
                      aspect ? "cursor-pointer" : ""
                    } ${
                      hoveredPlanet === rowPlanet.name ||
                      hoveredPlanet === colPlanet.name
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
  );
};
