import { AngleData, HouseData, type Cusp, type KeyAngle } from "../../../types/cusp";
import { useDesc } from "../../../contexts/DescContext";
import { createWedgePath, midpointAngle, onActivate, polarToCartesian } from "./Utils";
import type { OwnerType } from "../../../contexts/MultiWheelContext";
import { useChartSettings } from "../../../contexts/ChartSettingsContext";
import { useOwnerName } from "../../../hooks/chart/getNames";

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

export const Houses = ({ radius, innerRadius, center, angles, owner, keyAngles }: HouseProps) => {
  const {
    settings: {
      displayOptions: { angleLabels: showAngleLabels },
    },
  } = useChartSettings();

  const { open } = useDesc();
  const ownerName = useOwnerName(owner);
  const named = (name: string) => (ownerName ? `${name}, ${ownerName}` : name);

  const outerRadius = radius;

  const houseAngles = angles.sort((a, b) => a.name - b.name);

  return (
    <g>
      {houseAngles.map((house) => {
        const { name, angle, endAngle } = house;

        const wedgePath = createWedgePath(center, innerRadius, outerRadius, angle, endAngle);
        const midAngle = midpointAngle(angle, endAngle);

        const { x: tx, y: ty } = polarToCartesian(center, innerRadius + 15, midAngle);
        const openHouse = () => open({ type: "house", value: house.name, owner });

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
              role="button"
              tabIndex={0}
              aria-label={named(HouseData[name].name)}
              className="cursor-pointer transition-transform duration-200
              ease-in-out hover:scale-101 origin-[50%_50%] hover:drop-shadow-lg hover:opacity-40"
              d={wedgePath}
              fill="url(#houseGradient)"
              stroke="white"
              strokeWidth={1}
              onClick={openHouse}
              onKeyDown={onActivate(openHouse)}
            />
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              pointerEvents="none"
            >
              {name}
            </text>
          </g>
        );
      })}
      {keyAngles.map((keyAngle) => {
        const {
          name,
          angle,
          position: { degMin },
        } = keyAngle;
        const { x: innerX, y: innerY } = polarToCartesian(center, innerRadius, angle);
        const { x: outerX, y: outerY } = polarToCartesian(center, outerRadius, angle);
        const { x: lx, y: ly } = polarToCartesian(center, innerRadius + 18, angle + 4);
        const { x: dx, y: dy } = polarToCartesian(center, outerRadius - 15, angle + 2);
        const [deg, min] = degMin;
        const degLabel = `${Math.round(deg)}° ${Math.round(min)}′`;
        const openAngle = () => open({ type: "angle", value: keyAngle.name, owner });

        return (
          <g key={name}>
            <line x1={innerX} y1={innerY} x2={outerX} y2={outerY} stroke="white" strokeWidth={3} />
            <text
              role="button"
              tabIndex={0}
              aria-label={named(AngleData[name].name)}
              className="cursor-pointer fill-current hover:text-yellow-300
              ease-in-out hover:scale-101 duration-200 origin-[50%_50%]"
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              onClick={openAngle}
              onKeyDown={onActivate(openAngle)}
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
                className="max-sm:hidden"
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
