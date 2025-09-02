import { type Cusp } from "../../../contexts/ChartContext";
import { createWedgePath, midpointAngle, polarToCartesian } from "./Utils";

export interface CuspAngle extends Cusp {
  angle: number;
}

interface HouseProps {
  center: number;
  radius: number;
  angles: CuspAngle[];
  showAngleLabels: boolean;
}

export const Houses = ({
  radius,
  center,
  angles,
  showAngleLabels,
}: HouseProps) => {
  const innerRadius = radius - 120;
  const outerRadius = radius;

  const houseAngles = angles
    .filter(({ name }) => !["asc", "dc", "ic", "mc"].includes(name))
    .map(({ name, angle }) => ({
      number: parseInt(name.replace("cusp", ""), 10),
      angle,
    }))
    .sort((a, b) => a.number - b.number);

  const keyAngles = angles.filter(({ name }) =>
    ["asc", "dc", "ic", "mc"].includes(name),
  );

  return (
    <g>
      {houseAngles.map(({ number, angle }, i) => {
        const nextAngle = houseAngles[(i + 1) % houseAngles.length].angle;

        const wedgePath = createWedgePath(
          center,
          innerRadius,
          outerRadius,
          angle,
          nextAngle,
        );
        const midAngle = midpointAngle(angle, nextAngle);

        const { x: tx, y: ty } = polarToCartesian(
          center,
          innerRadius + 15,
          midAngle,
        );

        return (
          <g key={number}>
            <radialGradient
              id="houseGradient"
              cx="50%"
              cy="50%"
              r="50%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(255,255,255)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.1)" />
            </radialGradient>
            <path
              className="cursor-pointer transition-transform duration-200
              ease-in-out hover:scale-101 origin-[50%_50%] hover:drop-shadow-lg hover:opacity-40"
              d={wedgePath}
              fill="url(#houseGradient)"
              stroke="white"
              strokeWidth={1}
            />
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
            >
              {number}
            </text>
          </g>
        );
      })}
      {keyAngles.map(({ name, angle, deg_min }) => {
        const { x: innerX, y: innerY } = polarToCartesian(
          center,
          innerRadius,
          angle,
        );
        const { x: outerX, y: outerY } = polarToCartesian(
          center,
          outerRadius,
          angle,
        );
        const { x: lx, y: ly } = polarToCartesian(
          center,
          innerRadius + 18,
          angle + 4,
        );
        const { x: dx, y: dy } = polarToCartesian(center, outerRadius - 15, angle + 2);
        const [deg, min] = deg_min;
        const degLabel = `${Math.round(deg)}° ${Math.round(min)}′`;

        return (
          <g key={name}>
            <line
              x1={innerX}
              y1={innerY}
              x2={outerX}
              y2={outerY}
              stroke="white"
              strokeWidth={3}
            />
            <text
              className="cursor-pointer fill-current hover:text-yellow-300
              ease-in-out hover:scale-101 duration-200 origin-[50%_50%]"
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
            >
              {name.toUpperCase()}
            </text>
            {showAngleLabels && (
              <text
                x={dx}
                y={dy}
                fontSize={10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily='"Segoe UI Symbol", "Noto Sans Symbols", sans-serif'
                pointerEvents="none"
              >
                {degLabel}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
