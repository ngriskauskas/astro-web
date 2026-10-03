import { useState } from "react";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { AspectData, type AspectPoint } from "../../types/aspect";
import { AngleData } from "../../types/cusp";
import { PLANET_ORDER, PlanetsData, type Planet } from "../../types/planet";
import { useDesc } from "../../contexts/DescContext";
import { useWheelData } from "../../hooks/chart/useWheelData";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import { hiddenPlanets } from "../../utils/hiddenPlanets";
import { aspectName } from "../../utils/aspectName";
import { LoadError } from "../utils/LoadError";
import { MATRIX, MATRIX_CELL, MATRIX_TABLE } from "./matrixStyles";

export const AspectMatrix = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const { open } = useDesc();
  const {
    settings: { objectOptions },
  } = useChartSettings();

  const sortByPlanetOrder = (arr: Planet[]) =>
    [...arr].sort((a, b) => PLANET_ORDER.indexOf(a.name) - PLANET_ORDER.indexOf(b.name));

  const { planetAngles, keyAngles, status } = useWheel() as SingleWheelContextType;
  const hidden = hiddenPlanets(objectOptions);
  const planets = sortByPlanetOrder(planetAngles).filter(({ name }) => !hidden.includes(name));
  const matrixKeyAngles = keyAngles.filter(({ name }) => name === "ASC" || name === "MC");
  const points: AspectPoint[] = [
    ...planets.map((value) => ({ type: "Planet" as const, value })),
    ...matrixKeyAngles.map((value) => ({ type: "Angle" as const, value })),
  ];
  const aspects = useWheelData().getFilteredAspects();

  if (status === "error") return <LoadError message="Could not load the chart." />;
  if (points.length === 0) return null;

  return (
    <div className={MATRIX}>
      <table className={MATRIX_TABLE}>
        <thead className="bg-gray-100 font-semibold">
          <tr>
            <th className="border border-gray-300 p-0">
              <span className={MATRIX_CELL} />
            </th>
            {points.map((point) => (
              <th
                key={`${point.type}-${point.value.name}`}
                className={`border border-gray-300 p-0 transition-colors ${
                  hoveredPlanet === point.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(point)}
                onMouseEnter={() => setHoveredPlanet(point.value.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                <PointLabel point={point} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {points.map((rowPoint, rowIndex) => (
            <tr
              key={`${rowPoint.type}-${rowPoint.value.name}`}
              className={`transition-colors ${
                hoveredPlanet === rowPoint.value.name ? "bg-yellow-50" : ""
              }`}
            >
              <th
                scope="row"
                className={`border border-gray-300 bg-gray-50 p-0 font-semibold transition-colors ${
                  hoveredPlanet === rowPoint.value.name ? "bg-yellow-100" : ""
                }`}
                title={getPointTitle(rowPoint)}
                onMouseEnter={() => setHoveredPlanet(rowPoint.value.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                <PointLabel point={rowPoint} />
              </th>

              {points.map((colPoint, colIndex) => {
                const key = `${colPoint.type}-${colPoint.value.name}`;
                if (rowIndex === colIndex) {
                  return (
                    <td key={key} className="border border-gray-300 p-0 text-gray-300">
                      <span className={MATRIX_CELL}>–</span>
                    </td>
                  );
                }

                if (colIndex > rowIndex) {
                  return (
                    <td key={key} className="border border-gray-200 bg-gray-100 p-0" aria-hidden />
                  );
                }

                const aspect = aspects.find(
                  (candidate) =>
                    (samePoint(candidate.point1, rowPoint) &&
                      samePoint(candidate.point2, colPoint)) ||
                    (samePoint(candidate.point1, colPoint) &&
                      samePoint(candidate.point2, rowPoint)),
                );
                const highlighted =
                  hoveredPlanet === rowPoint.value.name || hoveredPlanet === colPoint.value.name;

                return (
                  <td
                    key={key}
                    className={`border border-gray-300 p-0 font-bold transition-all ${
                      highlighted ? "ring-2 ring-yellow-300" : ""
                    }`}
                  >
                    {aspect && (
                      <AspectCell
                        label={aspectName({ ...aspect, point1: rowPoint, point2: colPoint })}
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

export const AspectCell = ({
  label,
  type,
  onClick,
}: {
  label: string;
  type: keyof typeof AspectData;
  onClick: () => void;
}) => {
  const { color, glyph, name } = AspectData[type];
  return (
    <button
      type="button"
      aria-label={label}
      title={name}
      className={`${MATRIX_CELL} cursor-pointer bg-(--tint) hover:bg-(--tint-hover)`}
      style={
        { color, "--tint": `${color}20`, "--tint-hover": `${color}40` } as React.CSSProperties
      }
      onClick={onClick}
    >
      {glyph}
    </button>
  );
};

// A planet's glyph, or the short name of an angle (ASC, MC) in smaller letters.
export const PointLabel = ({ point }: { point: AspectPoint }) => (
  <span className={`${MATRIX_CELL} ${point.type === "Angle" ? "text-[0.7em] tracking-tighter" : ""}`}>
    {point.type === "Planet" ? PlanetsData[point.value.name].glyph : point.value.name}
  </span>
);

const samePoint = (left: AspectPoint, right: AspectPoint) =>
  left.type === right.type && left.value.name === right.value.name;

const getPointTitle = (point: AspectPoint) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;
