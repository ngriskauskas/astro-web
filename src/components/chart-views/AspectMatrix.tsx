import { useState } from "react";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData, type AspectPoint } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";

export const AspectMatrix = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const { open } = useDesc();

  const sortByPlanetOrder = (arr: Planet[]) =>
    [...arr].sort((a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name));

  const { planetAngles, keyAngles } = useWheel() as SingleWheelContextType;
  const planets = sortByPlanetOrder(planetAngles);
  const matrixKeyAngles = keyAngles.filter(({ name }) => name === "ASC" || name === "MC");
  const points: AspectPoint[] = [
    ...planets.map((value) => ({ type: "Planet" as const, value })),
    ...matrixKeyAngles.map((value) => ({ type: "Angle" as const, value })),
  ];
  const aspects = useWheelData().getFilteredAspects();

  return (
    <div className="overflow-x-auto ml-4">
      <table className="w-max table-fixed border border-gray-300 rounded-lg shadow-md overflow-hidden text-center">
        <thead className="bg-gray-100 text-sm font-semibold">
          <tr>
            <th className="w-12 min-w-12 max-w-12 px-1 py-2 border border-gray-300"></th>
            {points.map((point) => (
              <th
                key={`${point.type}-${point.value.name}`}
                className={`w-12 min-w-12 max-w-12 px-1 py-2 ${point.type === "Angle" ? "text-xs" : "text-xl"} border border-gray-300 cursor-pointer transition-colors ${
                  hoveredPlanet === point.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(point)}
                onMouseEnter={() => setHoveredPlanet(point.value.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {getPointLabel(point)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {points.map((rowPoint, rowIndex) => (
            <tr
              key={`${rowPoint.type}-${rowPoint.value.name}`}
              className={`text-sm transition-colors ${
                hoveredPlanet === rowPoint.value.name ? "bg-yellow-50" : ""
              }`}
            >
              <td
                className={`w-12 min-w-12 max-w-12 px-1 py-2 ${rowPoint.type === "Angle" ? "text-xs" : "text-xl"} font-semibold border border-gray-300 bg-gray-50 cursor-pointer transition-colors ${
                  hoveredPlanet === rowPoint.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(rowPoint)}
                onMouseEnter={() => setHoveredPlanet(rowPoint.value.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {getPointLabel(rowPoint)}
              </td>

              {points.map((colPoint, colIndex) => {
                if (rowIndex === colIndex) {
                  return (
                    <td
                      key={`${colPoint.type}-${colPoint.value.name}`}
                      className="w-12 min-w-12 max-w-12 px-1 py-2 text-gray-300 border border-gray-300"
                    >
                      –
                    </td>
                  );
                }

                if (colIndex > rowIndex) {
                  return (
                    <td
                      key={`${colPoint.type}-${colPoint.value.name}`}
                      className="w-12 min-w-12 max-w-12 px-1 py-2 border border-gray-200 bg-gray-100"
                      aria-hidden
                    />
                  );
                }

                const aspect = aspects.find(
                  (candidate) =>
                    (samePoint(candidate.point1, rowPoint) &&
                      samePoint(candidate.point2, colPoint)) ||
                    (samePoint(candidate.point1, colPoint) &&
                      samePoint(candidate.point2, rowPoint)),
                );

                const color = aspect ? AspectData[aspect.type].color : undefined;

                return (
                  <td
                    key={`${colPoint.type}-${colPoint.value.name}`}
                    className={`w-12 min-w-12 max-w-12 px-1 py-2 text-lg font-bold border border-gray-300 transition-all ${
                      aspect ? "cursor-pointer" : ""
                    } ${
                      hoveredPlanet === rowPoint.value.name || hoveredPlanet === colPoint.value.name
                        ? "ring-2 ring-yellow-300"
                        : ""
                    }`}
                    style={{
                      backgroundColor: color ? `${color}20` : undefined,
                      color: color ?? undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (aspect) {
                        e.currentTarget.style.backgroundColor = color ? `${color}40` : "";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (aspect) {
                        e.currentTarget.style.backgroundColor = color ? `${color}20` : "";
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

const samePoint = (left: AspectPoint, right: AspectPoint) =>
  left.type === right.type && left.value.name === right.value.name;

const getPointLabel = (point: AspectPoint) =>
  point.type === "Planet" ? PlanetsData[point.value.name].glyph : point.value.name;

const getPointTitle = (point: AspectPoint) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;
