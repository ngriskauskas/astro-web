import { useEffect, useState, type CSSProperties } from "react";
import { useDesc } from "../../contexts/DescContext";
import type { CuspType } from "../../types/cusp";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { QuadrantData, type QuadrantKey } from "../../types/hemisphere";
import { quadrantOf } from "../../utils/natalSummary";

// The chart as a circle of four quarters. Each quarter is shaded by how many planets it holds and
// is clickable; each planet's glyph sits at its house. The Ascendant is on the left, so the
// Personal quarter is lower left and the Collective quarter upper left, as in a chart.
const SIZE = 360;
const CENTRE = SIZE / 2;
const RADIUS = 150;

// Each quarter's arc in degrees, counter-clockwise from the east (the left of the circle).
const QUARTERS: readonly { key: QuadrantKey; number: 1 | 2 | 3 | 4; start: number; end: number }[] = [
  { key: "personal", number: 1, start: 180, end: 270 },
  { key: "private", number: 2, start: 270, end: 360 },
  { key: "relational", number: 3, start: 0, end: 90 },
  { key: "collective", number: 4, start: 90, end: 180 },
];

// The middle of each house, counter-clockwise from the Ascendant on the left.
const houseAngle = (house: CuspType) => 195 + (house - 1) * 30;

const point = (degrees: number, radius: number): [number, number] => {
  const radians = (degrees * Math.PI) / 180;
  return [CENTRE + radius * Math.cos(radians), CENTRE - radius * Math.sin(radians)];
};

const wedgePath = (start: number, end: number) => {
  const [startX, startY] = point(start, RADIUS);
  const [endX, endY] = point(end, RADIUS);
  return `M ${CENTRE} ${CENTRE} L ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 0 0 ${endX} ${endY} Z`;
};

// A colour as hue, saturation and lightness, so a quarter can be made stronger or quieter.
interface Hsl {
  h: number;
  s: number;
  l: number;
}

const hexToHsl = (hex: string): Hsl => {
  const value = parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
};

// How strongly a quarter is coloured. Half the planets in one quarter gives full strength; an
// empty quarter is nearly grey. `lift` lightens the tone, for the lighter centre of each quarter.
const tone = (base: Hsl, intensity: number, lift: number) => {
  const saturation = base.s * (0.12 + 0.4 * intensity);
  // Pulled towards the paper-white of the page, so even a full quarter stays soft.
  const lightness = 92 - (92 - base.l) * (0.2 + 0.4 * intensity) + lift;
  return `hsl(${base.h.toFixed(0)} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%)`;
};

// Counts from zero up to the target, easing out. Shows the target at once when motion is off.
const useCountUp = (target: number, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof window.requestAnimationFrame !== "function") {
      setValue(target);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
};

// A planet's place within its house, stacked inward when more than one planet shares a house.
const glyphPosition = (house: CuspType, stacked: number): [number, number] =>
  point(houseAngle(house), RADIUS * 0.82 - stacked * 17);

export const HemisphereWheel = ({ placements }: { placements: { planet: PlanetName; house: CuspType }[] }) => {
  const { open } = useDesc();
  const total = placements.length;
  const countIn = (number: 1 | 2 | 3 | 4) =>
    placements.filter((placement) => quadrantOf(placement.house) === number).length;
  const planetCount = useCountUp(total);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Placements by quarter of the chart"
      className="mx-auto w-full max-w-[360px] overflow-visible"
    >
      <defs>
        {QUARTERS.map(({ key, number }) => {
          const base = hexToHsl(QuadrantData[key].color);
          const intensity = Math.min(1, (countIn(number) / Math.max(total, 1)) * 2);
          return (
            <radialGradient key={key} id={`hemi-${key}`} cx={CENTRE} cy={CENTRE} r={RADIUS} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={tone(base, intensity, 6)} />
              <stop offset="1" stopColor={tone(base, intensity, 0)} />
            </radialGradient>
          );
        })}
      </defs>

      {QUARTERS.map(({ key, number, start, end }, index) => {
        const count = countIn(number);
        const info = QuadrantData[key];
        const [labelX, labelY] = point((start + end) / 2, RADIUS * 0.42);
        const open_ = () => open({ type: "quadrant", value: key });
        return (
          <g
            key={key}
            role="button"
            tabIndex={0}
            aria-label={`${info.name}, ${info.houses}: ${count} of ${total} placements`}
            className="hemi-quarter cursor-pointer outline-none"
            style={{ animationDelay: `${index * 120}ms`, transformOrigin: `${CENTRE}px ${CENTRE}px` }}
            onClick={open_}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open_();
              }
            }}
          >
            <path
              d={wedgePath(start, end)}
              fill={`url(#hemi-${key})`}
              stroke="#ffffff"
              strokeWidth={2.5}
              strokeLinejoin="round"
              className="transition-[filter] duration-500"
            />
            <text x={labelX} y={labelY - 2} textAnchor="middle" className="fill-gray-900 text-[13px] font-semibold tracking-wide">
              {info.name}
            </text>
            <text x={labelX} y={labelY + 14} textAnchor="middle" className="fill-gray-800 text-[11px] font-medium tabular-nums">
              <QuarterCount value={count} /> of {total}
            </text>
          </g>
        );
      })}

      {/* Outer ring with a tick at each house cusp, so the houses read as a chart. */}
      <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="none" stroke="#cbd5e1" strokeWidth={1} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => {
        const [x1, y1] = point(180 + index * 30, RADIUS);
        const [x2, y2] = point(180 + index * 30, RADIUS + 7);
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={1.5} />;
      })}

      {/* The centre: how many planets the circle holds. */}
      <circle cx={CENTRE} cy={CENTRE} r={24} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} className="drop-shadow-sm" />
      <text x={CENTRE} y={CENTRE + 1} textAnchor="middle" className="fill-gray-900 text-[16px] font-semibold tabular-nums">
        {planetCount}
      </text>
      <text x={CENTRE} y={CENTRE + 11} textAnchor="middle" className="fill-gray-500 text-[7px] font-medium uppercase tracking-wider">
        planets
      </text>

      {placements.map((placement, index) => {
        const stacked = placements.slice(0, index).filter((other) => other.house === placement.house).length;
        const [x, y] = glyphPosition(placement.house, stacked);
        const info = PlanetsData[placement.planet];
        const open_ = () => open({ type: "planet", value: placement.planet });
        const style: CSSProperties = {
          animationDelay: `${600 + index * 70}ms`,
          transformOrigin: `${x}px ${y}px`,
        };
        return (
          <g
            key={placement.planet}
            role="button"
            tabIndex={0}
            aria-label={`${info.displayName} in house ${placement.house}`}
            className="hemi-glyph cursor-pointer outline-none"
            style={style}
            onClick={open_}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open_();
              }
            }}
          >
            <g className="hemi-glyph-float" style={{ animationDelay: `${index * 350}ms` }}>
              <circle cx={x} cy={y} r={12} fill="#ffffff" stroke={info.color} strokeWidth={1.5} className="drop-shadow" />
              <text x={x} y={y + 4.5} textAnchor="middle" className="text-[13px]" style={{ fill: info.color }}>
                {info.glyph}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// A quarter's count, counting up from zero.
const QuarterCount = ({ value }: { value: number }) => <>{useCountUp(value, 700)}</>;
