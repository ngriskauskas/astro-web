import { useState } from "react";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData, type Aspect, type AspectPoint } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";
import { useProfileNames } from "../../hooks/chart/getNames";

export const MultiAspectMatrix = () => {
  const [hoveredRowPlanet, setHoveredRowPlanet] = useState<string | null>(null);
  const [hoveredColPlanet, setHoveredColPlanet] = useState<string | null>(null);
  const { open } = useDesc();

  const sortByPlanetOrder = (arr: Planet[]) =>
    [...arr].sort((a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name));

  const { mainPlanetAngles, otherPlanetAngles, mainKeyAngles, otherKeyAngles } =
    useWheel() as MultiWheelContextType;

  const mainPlanets = sortByPlanetOrder(mainPlanetAngles);
  const otherPlanets = sortByPlanetOrder(otherPlanetAngles);
  const mainMatrixKeyAngles = mainKeyAngles.filter(({ name }) => name === "ASC" || name === "MC");
  const otherMatrixKeyAngles = otherKeyAngles.filter(({ name }) => name === "ASC" || name === "MC");
  const mainPoints: AspectPoint[] = [
    ...mainPlanets.map((value) => ({ type: "Planet" as const, value })),
    ...mainMatrixKeyAngles.map((value) => ({ type: "Angle" as const, value })),
  ];
  const otherPoints: AspectPoint[] = [
    ...otherPlanets.map((value) => ({ type: "Planet" as const, value })),
    ...otherMatrixKeyAngles.map((value) => ({ type: "Angle" as const, value })),
  ];

  const aspects = useWheelData().getFilteredAspects();
  const { mainProfileName, otherProfileName } = useProfileNames();

  return (
    <div className="overflow-x-auto">
      <div className="relative flex items-center">
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-20 text-right font-semibold whitespace-nowrap rotate-[-90deg]">
          {`${otherProfileName} Chart Points`}
        </div>
        <div className="ml-11">
          <div className="text-center font-semibold mb-1">{`${mainProfileName} Chart Points`}</div>
          <table className="w-max table-fixed border border-gray-300 rounded-lg shadow-md overflow-hidden text-center">
            <thead className="bg-gray-100 text-sm font-semibold">
              <tr>
                <th className="w-12 min-w-12 max-w-12 px-1 py-2 border border-gray-300"></th>
                {mainPoints.map((point) => (
                  <th
                    key={`${point.type}-${point.value.name}`}
                    className={`w-12 min-w-12 max-w-12 px-1 py-2 ${point.type === "Angle" ? "text-xs" : "text-xl"} border border-gray-300 cursor-pointer transition-colors ${
                      hoveredColPlanet === point.value.name ? "bg-yellow-100" : ""
                    }`}
                    title={getPointTitle(point)}
                    onMouseEnter={() => setHoveredColPlanet(point.value.name)}
                    onMouseLeave={() => setHoveredColPlanet(null)}
                  >
                    {getPointLabel(point)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {otherPoints.map((rowPoint) => (
                <tr
                  key={`${rowPoint.type}-${rowPoint.value.name}`}
                  className={`text-sm transition-colors ${
                    hoveredRowPlanet === rowPoint.value.name ? "bg-yellow-50" : ""
                  }`}
                >
                  <td
                    className={`w-12 min-w-12 max-w-12 px-1 py-2 ${rowPoint.type === "Angle" ? "text-xs" : "text-xl"} font-semibold border border-gray-300 bg-gray-50 cursor-pointer transition-colors ${
                      hoveredRowPlanet === rowPoint.value.name ? "bg-yellow-100" : ""
                    }`}
                    title={getPointTitle(rowPoint)}
                    onMouseEnter={() => setHoveredRowPlanet(rowPoint.value.name)}
                    onMouseLeave={() => setHoveredRowPlanet(null)}
                  >
                    {getPointLabel(rowPoint)}
                  </td>

                  {mainPoints.map((colPoint) => {
                    const aspect = aspects.find((candidate) =>
                      matchesMainOtherPoints(candidate, colPoint, rowPoint),
                    );
                    const color = aspect ? AspectData[aspect.type].color : undefined;

                    return (
                      <td
                        key={`${colPoint.type}-${colPoint.value.name}`}
                        className={`w-12 min-w-12 max-w-12 px-1 py-2 text-lg font-bold border border-gray-300 transition-all ${
                          aspect ? "cursor-pointer" : ""
                        } ${
                          hoveredRowPlanet === rowPoint.value.name ||
                          hoveredColPlanet === colPoint.value.name
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
      </div>
    </div>
  );
};

const samePoint = (left: AspectPoint, right: AspectPoint) =>
  left.type === right.type && left.value.name === right.value.name;

const matchesMainOtherPoints = (
  aspect: Aspect,
  mainPoint: AspectPoint,
  otherPoint: AspectPoint,
) => {
  const point1Owner = aspect.point1Owner ?? "main";
  const point2Owner = point1Owner === "main" ? "other" : "main";

  return (
    (point1Owner === "main" &&
      point2Owner === "other" &&
      samePoint(aspect.point1, mainPoint) &&
      samePoint(aspect.point2, otherPoint)) ||
    (point1Owner === "other" &&
      point2Owner === "main" &&
      samePoint(aspect.point1, otherPoint) &&
      samePoint(aspect.point2, mainPoint))
  );
};

const getPointLabel = (point: AspectPoint) =>
  point.type === "Planet" ? PlanetsData[point.value.name].glyph : point.value.name;

const getPointTitle = (point: AspectPoint) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;
