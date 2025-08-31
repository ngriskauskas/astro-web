import { ZodiacSigns, type ZodiacSign } from "../../../contexts/ChartContext";

interface SignProps {
  center: number;
  radius: number;
  angles: { sign: ZodiacSign; angle: number }[];
}

export const Signs = ({ radius, center, angles }: SignProps) => {
  const innerRadius = radius - 25;
  const outerRadius = radius;
  return (
    <g>
      {angles.map(({ sign, angle }) => {
        const rad = ((angle - 180) * Math.PI) / 180;
        const x1 = center + innerRadius * Math.cos(rad);
        const y1 = center - innerRadius * Math.sin(rad);
        const x2 = center + outerRadius * Math.cos(rad);
        const y2 = center - outerRadius * Math.sin(rad);

        const textRadius = outerRadius + 20;
        const tx = center + textRadius * Math.cos(rad);
        const ty = center - textRadius * Math.sin(rad);
        return (
          <g key={sign}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
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
              {sign}
            </text>
          </g>
        );
      })}
    </g>
  );
};
