import { polarToCartesian } from "./Utils";
import { type PlanetAngle } from "./Planets";
import type { Aspect, PlanetName } from "../../../contexts/ChartContext";
import type { AspectOptions, ObjectOptions } from "../ZodiacWheelSettings";

const aspectColors: Record<string, string> = {
  conjunction: "#FFD700",
  opposition: "#FF0000",
  trine: "#00FF00",
  square: "#FF0000",
  sextile: "#00FF00",
};

interface AspectProps {
  center: number;
  radius: number;
  angles: PlanetAngle[];
  aspects: Aspect[];
  hoveredPlanet: PlanetName | null;
  options: AspectOptions;
  objectOptions: ObjectOptions;
}

export const Aspects = ({
  radius,
  center,
  angles,
  aspects,
  hoveredPlanet,
  options,
  objectOptions,
}: AspectProps) => {
  return (
    <g>
      {aspects.map(({ type, orb, planet1, planet2 }, i) => {
        const { minOrb, show } = options[type];
        if (!show || orb > minOrb) return;

        if (
          !objectOptions.showChiron &&
          (planet1.name === "Chiron" || planet2.name === "Chiron")
        )
          return;

        if (
          (planet1.name === "mean Apogee" || planet2.name === "mean Apogee") &&
          (objectOptions.lilith === "true" || !objectOptions.lilith)
        )
          return;
        if (
          (planet1.name === "osc. Apogee" || planet2.name === "osc. Apogee") &&
          (objectOptions.lilith === "mean" || !objectOptions.lilith)
        )
          return;

        const isHighlighted =
          hoveredPlanet &&
          (planet1.name === hoveredPlanet || planet2.name === hoveredPlanet);

        const planet1Angle = angles.find(
          ({ name }) => name === planet1.name,
        )!.angle;
        const planet2Angle = angles.find(
          ({ name }) => name === planet2.name,
        )!.angle;
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
