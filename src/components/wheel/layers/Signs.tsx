import { ZodiacData } from "../../../constants/zodiac";
import { type ZodiacSign } from "../../../contexts/ChartContext";
import { createWedgePath, polarToCartesian } from "./Utils";

export interface SignAngle {
  sign: ZodiacSign;
  angle: number;
}

interface SignProps {
  center: number;
  radius: number;
  angles: SignAngle[];
}

export const Signs = ({ radius, center, angles }: SignProps) => {
  const innerRadius = radius - 50;
  const outerRadius = radius;
  return (
    <g>
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="white"
        strokeWidth={1}
      />
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="white"
        strokeWidth={1}
      />
      {angles.map(({ sign, angle }) => {
        const { glyph, color } = ZodiacData[sign];

        const midRadius = (innerRadius + outerRadius) / 2;
        const { x, y } = polarToCartesian(center, midRadius, angle + 15);

        return (
          <g key={sign}>
            <path
              d={createWedgePath(
                center,
                innerRadius,
                outerRadius,
                angle,
                angle + 30,
              )}
              fill={color}
              stroke="white"
              fillRule="evenodd"
            />
            <image href={glyph} x={x - 12} y={y - 12} width={25} height={25} />
          </g>
        );
      })}
    </g>
  );
};
