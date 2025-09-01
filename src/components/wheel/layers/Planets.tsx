import { PlanetsData } from "../../../constants/zodiac";
import { type Planet } from "../../../contexts/ChartContext";
import { polarToCartesian } from "./Utils";

export interface PlanetAngle extends Planet {
  angle: number;
  glyphAngle: number;
}

interface PlanetProps {
  center: number;
  radius: number;
  angles: PlanetAngle[];
}

export const Planets = ({ radius, center, angles }: PlanetProps) => {
  const innerRadius = radius - 10;
  const outerRadius = radius;

  return (
    <g>
      {angles.map(({ name, angle, glyphAngle }) => {
        const { x: x1, y: y1 } = polarToCartesian(center, innerRadius, angle);
        const { x: x2, y: y2 } = polarToCartesian(center, outerRadius, angle);
        const { x: tx, y: ty } = polarToCartesian(
          center,
          outerRadius - 25,
          glyphAngle,
        );

        const planetInfo = PlanetsData[name];
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
            <text
              className="font-normal"
              x={tx}
              y={ty}
              fontSize={26 * planetInfo.scale}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"Segoe UI Symbol", "Noto Sans Symbols", sans-serif'
            >
              {planetInfo.glyph}
            </text>
          </g>
        );
      })}
    </g>
  );
};
