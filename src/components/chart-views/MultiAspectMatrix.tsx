import { useState } from "react";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData, type Aspect, type AspectPoint } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";
import { useProfileNames } from "../../hooks/chart/getNames";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import { hiddenPlanets } from "../../utils/hiddenPlanets";
import { pointName } from "../../utils/aspectName";
import { LoadError } from "../utils/LoadError";
import { AspectCell, PointLabel } from "./AspectMatrix";
import { MATRIX, MATRIX_CELL, MATRIX_TABLE } from "./matrixStyles";

export const MultiAspectMatrix = () => {
  const [hoveredRowPlanet, setHoveredRowPlanet] = useState<string | null>(null);
  const [hoveredColPlanet, setHoveredColPlanet] = useState<string | null>(null);
  const { open } = useDesc();
  const {
    settings: { objectOptions },
  } = useChartSettings();

  const hidden = hiddenPlanets(objectOptions);
  const shownInOrder = (arr: Planet[]) =>
    [...arr]
      .filter(({ name }) => !hidden.includes(name))
      .sort((a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name));

  const { mainPlanetAngles, otherPlanetAngles, mainKeyAngles, otherKeyAngles, status } =
    useWheel() as MultiWheelContextType;

  const mainPlanets = shownInOrder(mainPlanetAngles);
  const otherPlanets = shownInOrder(otherPlanetAngles);
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

  if (status === "error") return <LoadError message="Could not load the chart." />;
  if (mainPoints.length === 0) return null;

  return (
    <div className={MATRIX}>
      <div className="mb-1 flex flex-wrap justify-between gap-x-4 text-xs font-semibold sm:text-sm">
        <span>
          <span aria-hidden="true">↓ </span>
          {`${otherProfileName} Chart Points`}
        </span>
        <span>
          {`${mainProfileName} Chart Points`}
          <span aria-hidden="true"> →</span>
        </span>
      </div>
      <table className={MATRIX_TABLE}>
        <thead className="bg-gray-100 font-semibold">
          <tr>
            <th className="border border-gray-300 p-0">
              <span className={MATRIX_CELL} />
            </th>
            {mainPoints.map((point) => (
              <th
                key={`${point.type}-${point.value.name}`}
                className={`border border-gray-300 p-0 transition-colors ${
                  hoveredColPlanet === point.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(point)}
                onMouseEnter={() => setHoveredColPlanet(point.value.name)}
                onMouseLeave={() => setHoveredColPlanet(null)}
              >
                <PointLabel point={point} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {otherPoints.map((rowPoint) => (
            <tr
              key={`${rowPoint.type}-${rowPoint.value.name}`}
              className={`transition-colors ${
                hoveredRowPlanet === rowPoint.value.name ? "bg-yellow-50" : ""
              }`}
            >
              <th
                scope="row"
                className={`border border-gray-300 bg-gray-50 p-0 font-semibold transition-colors ${
                  hoveredRowPlanet === rowPoint.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(rowPoint)}
                onMouseEnter={() => setHoveredRowPlanet(rowPoint.value.name)}
                onMouseLeave={() => setHoveredRowPlanet(null)}
              >
                <PointLabel point={rowPoint} />
              </th>

              {mainPoints.map((colPoint) => {
                const aspect = aspects.find((candidate) =>
                  matchesMainOtherPoints(candidate, colPoint, rowPoint),
                );
                const highlighted =
                  hoveredRowPlanet === rowPoint.value.name ||
                  hoveredColPlanet === colPoint.value.name;

                return (
                  <td
                    key={`${colPoint.type}-${colPoint.value.name}`}
                    className={`border border-gray-300 p-0 font-bold transition-all ${
                      highlighted ? "ring-2 ring-yellow-300" : ""
                    }`}
                  >
                    {aspect && (
                      <AspectCell
                        label={`${otherProfileName} ${pointName(rowPoint)} ${AspectData[aspect.type].name} ${mainProfileName} ${pointName(colPoint)}`}
                        type={aspect.type}
                        onClick={() => open({ type: "aspect", value: aspect })}
                      />
                    )}
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

const getPointTitle = (point: AspectPoint) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;
