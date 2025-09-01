import { polarToCartesian } from "./Utils";
import { type PlanetAngle } from "./Planets";
import type { Aspect } from "../../../contexts/ChartContext";

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
  minOrb: number;
}

export const Aspects = ({
  radius,
  center,
  angles,
  aspects,
  minOrb,
}: AspectProps) => {
  return (
    <g>
      {aspects.map(({ type, orb, planet1, planet2 }, i) => {
        if (orb > minOrb) return;
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
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={aspectColors[type]}
            strokeDasharray={orb > 5 ? "4 2" : undefined}
            strokeWidth={orb < 2 ? 2 : 1}
          />
        );
      })}
    </g>
  );
};
