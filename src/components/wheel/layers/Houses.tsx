import { type Cusp, type KeyAngle } from "../../../types/cusp";
import { useDesc } from "../../../contexts/DescContext";
import { useWheel } from "../../../hooks/useWheel";
import { createWedgePath, midpointAngle, polarToCartesian } from "./Utils";
import type { OwnerType } from "../../../contexts/MultiWheelContext";

export interface CuspAngle extends Cusp {
  angle: number;
  endAngle: number;
}

export interface KeyAngleAngle extends KeyAngle {
  angle: number;
}

interface HouseProps {
  center: number;
  radius: number;
  innerRadius: number;
  angles: CuspAngle[];
  keyAngles: KeyAngleAngle[];
  owner?: OwnerType;
}

export const Houses = ({
  radius,
  innerRadius,
  center,
  angles,
  owner,
  keyAngles,
}: HouseProps) => {
  const {
    settings: {
      displayOptions: { angleLabels: showAngleLabels },
    },
  } = useWheel();

  const { open } = useDesc();

  const outerRadius = radius;

  const houseAngles = angles.sort((a, b) => a.name - b.name);

  return (
    <g>
      {houseAngles.map((house) => {
        const { name, angle, endAngle } = house;

        const wedgePath = createWedgePath(
          center,
          innerRadius,
          outerRadius,
          angle,
          endAngle,
        );
        const midAngle = midpointAngle(angle, endAngle);

        const { x: tx, y: ty } = polarToCartesian(
          center,
          innerRadius + 15,
          midAngle,
        );

        return (
          <g key={name}>
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
              onClick={() => open({ type: "house", value: house.name, owner })}
            />
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
            >
              {name}
            </text>
          </g>
        );
      })}
      {keyAngles.map((keyAngle) => {
        const { name, angle, deg_min } = keyAngle;
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
        const { x: dx, y: dy } = polarToCartesian(
          center,
          outerRadius - 15,
          angle + 2,
        );
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
              onClick={() =>
                open({ type: "angle", value: keyAngle.name, owner })
              }
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
