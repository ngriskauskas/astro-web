import { ZodiacData } from "../../../constants/zodiac";
import { type ZodiacSign } from "../../../contexts/ChartContext";
import { createWedgePath } from "./Utils";

interface SignProps {
  center: number;
  radius: number;
  angles: { sign: ZodiacSign; angle: number }[];
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
        const rad = ((angle + 15 - 180) * Math.PI) / 180;
        const midRadius = (innerRadius + outerRadius) / 2;
        const tx = center + midRadius * Math.cos(rad);
        const ty = center - midRadius * Math.sin(rad);

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
            <image 
              href={glyph}
              x={tx - 12}
              y={ty - 12}
              width={25}
              height={25}
            />
          </g>
        );
      })}
    </g>
  );
};
