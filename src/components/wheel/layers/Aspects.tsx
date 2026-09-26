import { polarToCartesian } from "./Utils";
import { useWheel } from "../../../hooks/useWheel";
import { useChartSettings } from "../../../contexts/ChartSettingsContext";
import type { SingleWheelContextType } from "../../../contexts/SingleWheelContext";
import type { PlanetName } from "../../../types/planet";
import type { AspectType } from "../../../types/aspect";

const aspectColors: Record<AspectType, string> = {
  CONJUNCTION: "#FFD700",
  OPPOSITION: "#FF0000",
  TRINE: "#00FF00",
  SQUARE: "#FF0000",
  SEXTILE: "#00FF00",
};

interface AspectProps {
  center: number;
  radius: number;
  hoveredPlanet: PlanetName | null;
}

export const Aspects = ({ radius, center, hoveredPlanet }: AspectProps) => {
  const { planetAngles: angles, aspects } = useWheel() as SingleWheelContextType;
  const {
    settings: { aspectOptions: options, objectOptions },
  } = useChartSettings();

  return (
    <g>
      {aspects.map(({ type, orb, point1, point2 }, i) => {
        const { minOrb, show } = options[type];
        if (!show || orb > minOrb) return;

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

        const isHighlighted =
          hoveredPlanet &&
          (point1.value.name === hoveredPlanet || point2.value.name === hoveredPlanet);

        const planet1Angle = angles.find(({ name }) => name === point1.value.name)!.angle;
        const planet2Angle = angles.find(({ name }) => name === point2.value.name)!.angle;
        const { x: x1, y: y1 } = polarToCartesian(center, radius, planet1Angle);
        const { x: x2, y: y2 } = polarToCartesian(center, radius, planet2Angle);
        return (
          <line
            className={`transition-colors duration-200 ${
              isHighlighted ? "opacity-100" : "opacity-50"
            }`}
            key={i}
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
