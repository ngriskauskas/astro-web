import { type ZodiacSign, ZodiacData } from "../../../types/zodiac";
import { useDesc } from "../../../contexts/DescContext";
import { useWheel } from "../../../hooks/useWheel";
import { createWedgePath, onActivate, polarToCartesian } from "./Utils";
import { useChartSettings } from "../../../contexts/ChartSettingsContext";

export interface SignAngle {
  sign: ZodiacSign;
  angle: number;
}

interface SignProps {
  center: number;
  radius: number;
}

export const Signs = ({ radius, center }: SignProps) => {
  const { signAngles: angles } = useWheel();

  const {
    settings: {
      displayOptions: { tickMarks: showTickMarks },
    },
  } = useChartSettings();

  const { open } = useDesc();

  const innerRadius = radius - 50;
  const outerRadius = radius;
  return (
    <g>
      {angles.map(({ sign, angle }) => {
        const { glyph, color, displayName } = ZodiacData[sign];
        const openSign = () => open({ type: "sign", value: sign });

        const midRadius = (innerRadius + outerRadius) / 2;
        const { x, y } = polarToCartesian(center, midRadius, angle + 15);

        return (
          <g
            key={sign}
            className="cursor-pointer transition-transform duration-200 
             ease-in-out hover:scale-101 origin-[50%_50%] hover:drop-shadow-lg hover:opacity-80"
          >
            <defs>
              <linearGradient id={`grad-${sign}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity={0.5}>
                  <animate
                    attributeName="stop-opacity"
                    values="0.5;1;0.5"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="50%" stopColor={color} stopOpacity={0.8}>
                  <animate
                    attributeName="stop-opacity"
                    values="0.8;0.5;0.8"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor={color} stopOpacity={0.5}>
                  <animate
                    attributeName="stop-opacity"
                    values="0.5;1;0.5"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
            <path
              role="button"
              tabIndex={0}
              aria-label={displayName}
              d={createWedgePath(center, innerRadius, outerRadius, angle, angle + 30)}
              fill={`url(#grad-${sign})`}
              stroke="white"
              fillRule="evenodd"
              onClick={openSign}
              onKeyDown={onActivate(openSign)}
            />
            <image href={glyph} x={x - 12} y={y - 12} width={25} height={25} pointerEvents="none" />
            {showTickMarks &&
              Array.from({ length: 29 }, (_, i) => {
                const tickAngle = angle + (i + 1);
                let tickLength: number;
                if ((i + 1) % 10 === 0) {
                  tickLength = 15;
                } else if ((i + 1) % 5 === 0) {
                  tickLength = 10;
                } else {
                  tickLength = 4;
                }

                const p1 = polarToCartesian(center, innerRadius, tickAngle);
                const p2 = polarToCartesian(center, innerRadius + tickLength, tickAngle);

                return (
                  <line
                    key={tickAngle}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              })}
          </g>
        );
      })}
    </g>
  );
};
