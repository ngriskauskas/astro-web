import { PlanetsData } from "../../../constants/zodiac";
import {
  type Cusp,
  type Planet,
  type ZodiacSign,
} from "../../../contexts/ChartContext";

interface PlanetAngle extends Planet {
  angle: number;
}

interface PlanetProps {
  center: number;
  radius: number;
  angles: PlanetAngle[];
}

export const Planets = ({ radius, center, angles }: PlanetProps) => {
  const innerRadius = radius - 25;
  const outerRadius = radius;
  return (
    <g>
      {angles.map(({ name, angle }) => {
        const rad = ((angle - 180) * Math.PI) / 180;
        const x1 = center + innerRadius * Math.cos(rad);
        const y1 = center - innerRadius * Math.sin(rad);
        const x2 = center + outerRadius * Math.cos(rad);
        const y2 = center - outerRadius * Math.sin(rad);

        const textRadius = outerRadius + 20;
        const tx = center + textRadius * Math.cos(rad);
        const ty = center - textRadius * Math.sin(rad);
        return (
          <g key={name}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth={1}
            />
            <image
              href={PlanetsData[name]}
              x={tx - 10}
              y={ty - 10}
              width={25}
              height={25}
            />
          </g>
        );
      })}
    </g>
  );
};
