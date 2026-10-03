import { polarToCartesian } from "./Utils";
import { useWheel } from "../../../hooks/useWheel";
import type { MultiWheelContextType } from "../../../contexts/MultiWheelContext";
import type { PlanetName } from "../../../types/planet";
import type { AspectPoint, AspectType } from "../../../types/aspect";
import { useChartSettings } from "../../../contexts/ChartSettingsContext";
import type { OwnerType } from "../../../contexts/MultiWheelContext";

const aspectColors: Record<AspectType, string> = {
  CONJUNCTION: "#FFD700",
  OPPOSITION: "#FF0000",
  TRINE: "#00FF00",
  SQUARE: "#FF0000",
  SEXTILE: "#00FF00",
};

interface MultiAspectProps {
  center: number;
  radius: number;
  hoveredPlanet: { planet: PlanetName; profile: "main" | "other" } | null;
}

export const MultiAspects = ({ radius, center, hoveredPlanet }: MultiAspectProps) => {
  const { mainPlanetAngles, otherPlanetAngles, mainKeyAngles, otherKeyAngles, aspects } =
    useWheel() as MultiWheelContextType;

  const {
    settings: { objectOptions },
  } = useChartSettings();

  return (
    <g>
      {aspects.map(({ type, orb, point1, point1Owner, point2 }, i) => {
        if (
          !objectOptions.showChiron &&
          (point1.value.name === "CHIRON" || point2.value.name === "CHIRON")
        )
          return;
        if (
          !objectOptions.showLilith &&
          (point1.value.name === "LILITH" || point2.value.name === "LILITH")
        )
          return;

        const firstOwner = point1Owner ?? "main";
        const secondOwner = otherOwner(firstOwner);
        const isHighlighted =
          hoveredPlanet &&
          ((point1.type === "Planet" &&
            firstOwner === hoveredPlanet.profile &&
            point1.value.name === hoveredPlanet.planet) ||
            (point2.type === "Planet" &&
              secondOwner === hoveredPlanet.profile &&
              point2.value.name === hoveredPlanet.planet));

        const point1Angle = getPointAngle(
          point1,
          firstOwner,
          mainPlanetAngles,
          otherPlanetAngles,
          mainKeyAngles,
          otherKeyAngles,
        );
        const point2Angle = getPointAngle(
          point2,
          secondOwner,
          mainPlanetAngles,
          otherPlanetAngles,
          mainKeyAngles,
          otherKeyAngles,
        );
        if (point1Angle === undefined || point2Angle === undefined) return null;

        const { x: x1, y: y1 } = polarToCartesian(center, radius, point1Angle);
        const { x: x2, y: y2 } = polarToCartesian(center, radius, point2Angle);

        return (
          <line
            className={`transition-colors duration-200 ${
              isHighlighted ? "opacity-100" : "opacity-50"
            }`}
            key={i}
            data-aspect={type}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={aspectColors[type]}
            strokeDasharray={orb > 5 ? "4 2" : undefined}
            strokeWidth={isHighlighted ? 3.5 : orb < 2 ? 1.5 : 1}
          />
        );
      })}
    </g>
  );
};

const otherOwner = (owner: OwnerType): OwnerType => (owner === "main" ? "other" : "main");

const getPointAngle = (
  point: AspectPoint,
  owner: OwnerType,
  mainPlanets: MultiWheelContextType["mainPlanetAngles"],
  otherPlanets: MultiWheelContextType["otherPlanetAngles"],
  mainKeyAngles: MultiWheelContextType["mainKeyAngles"],
  otherKeyAngles: MultiWheelContextType["otherKeyAngles"],
) => {
  const planets = owner === "main" ? mainPlanets : otherPlanets;
  const keyAngles = owner === "main" ? mainKeyAngles : otherKeyAngles;
  return point.type === "Planet"
    ? planets.find(({ name }) => name === point.value.name)?.angle
    : keyAngles.find(({ name }) => name === point.value.name)?.angle;
};
