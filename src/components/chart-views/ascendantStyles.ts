import type { CSSProperties } from "react";

export type AscendantLook = "dark" | "light";

export const ASCENDANT_LOOKS = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
] as const;

export interface AscendantStyle {
  viewport: string;
  ambient?: boolean;
  viewportStyle?: CSSProperties;
  time: string;
  signColumn: string;
  sign: string;
  signStyle: (color: string) => CSSProperties;
  signGlyph: string;
  signLabel: string;
  hourColumn: string;
  hour: string;
  hourStyle: (color: string, isDay: boolean, isCurrent: boolean) => CSSProperties;
  hourText: string;
  hourGlyph: string;
  hourGlyphStyle: (color: string, isCurrent: boolean) => CSSProperties;
  rail: string;
  connector: string;
  tick: string;
  marker: string;
  markerStyle: (color: string) => CSSProperties;
  chip: string;
  empty: string;
  nowLine: string;
  nowLabel: string;
}

const hoverLift =
  "transition-[filter,transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:brightness-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset";

// Planet colours are chosen for light backgrounds; this keeps dark ones legible on the night sky.
const lighten = (color: string) => `color-mix(in srgb, ${color} 55%, white)`;

// Night sky: a deep gradient with faint stars, signs as glowing bands, hours as frosted glass.
const dark: AscendantStyle = {
  viewport: "border-indigo-950/60 shadow-inner",
  ambient: true,
  viewportStyle: {
    backgroundColor: "#12123a",
    backgroundImage: [
      "radial-gradient(1.2px 1.2px at 12% 8%, rgb(255 255 255 / 0.75), transparent)",
      "radial-gradient(1px 1px at 78% 22%, rgb(255 255 255 / 0.6), transparent)",
      "radial-gradient(1.4px 1.4px at 34% 47%, rgb(255 255 255 / 0.55), transparent)",
      "radial-gradient(1px 1px at 90% 71%, rgb(255 255 255 / 0.6), transparent)",
      "radial-gradient(1.2px 1.2px at 55% 90%, rgb(255 255 255 / 0.7), transparent)",
      "linear-gradient(180deg, #14123f 0%, #231a5c 38%, #1b3a6b 72%, #123456 100%)",
    ].join(","),
    backgroundSize: "140px 190px, 170px 220px, 120px 160px, 190px 240px, 150px 200px, 100% 100%",
  },
  time: "text-indigo-200/80",
  signColumn: "border-x border-white/10",
  sign: `border-b border-white/10 ${hoverLift} focus-visible:outline-white`,
  signStyle: (color) => ({
    background: `linear-gradient(135deg, ${color}cc, ${color}55 70%, ${color}22)`,
    boxShadow: `inset 0 0 28px ${color}66, inset 3px 0 0 ${color}`,
  }),
  signGlyph: "h-6 w-6 shrink-0 brightness-0 invert drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]",
  signLabel: "text-[10px] font-semibold leading-tight tracking-wide text-white",
  hourColumn: "border-r border-white/10",
  hour: "border-t border-white/10",
  hourStyle: (color, _isDay, isCurrent) => ({
    background: isCurrent
      ? `linear-gradient(180deg, ${color}77, ${color}22)`
      : "linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.03))",
    boxShadow: isCurrent ? `0 0 18px ${color}88, inset 0 0 0 1px ${color}aa` : undefined,
  }),
  hourText: "text-indigo-100/80",
  hourGlyph: "text-base sm:text-lg",
  hourGlyphStyle: (color) => ({ color: lighten(color), filter: "drop-shadow(0 0 5px currentColor)" }),
  rail: "border-white/25",
  connector: "bg-fuchsia-400/70",
  tick: "bg-fuchsia-300",
  marker:
    "rounded-full border border-white/25 text-lg shadow-[0_0_14px_rgb(165_180_252/0.35)] backdrop-blur transition hover:border-white/60 hover:shadow-[0_0_20px_rgb(165_180_252/0.7)]",
  markerStyle: (color) => ({
    color: lighten(color),
    background: "linear-gradient(145deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.04))",
  }),
  chip: "border-white/20 bg-white/10 text-indigo-100",
  empty: "text-indigo-200/70",
  nowLine: "border-cyan-300 shadow-[0_0_10px_rgb(103_232_249/0.9)]",
  nowLabel: "bg-cyan-300 text-indigo-950",
};

// Daylight version: no backdrop, just glowing signs and frosted hours on the card.
const light: AscendantStyle = {
  viewport: "border-gray-200 bg-white shadow-inner",
  time: "text-gray-500",
  signColumn: "border-x border-gray-200",
  sign: `border-b border-white/70 ${hoverLift} focus-visible:outline-gray-700`,
  signStyle: (color) => ({
    background: `linear-gradient(135deg, ${color}8c, ${color}38 70%, ${color}1a)`,
    boxShadow: `inset 0 0 26px ${color}40, inset 3px 0 0 ${color}`,
  }),
  signGlyph: "h-6 w-6 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]",
  signLabel: "text-[10px] font-semibold leading-tight tracking-wide text-gray-900",
  hourColumn: "border-r border-gray-200",
  hour: "border-t border-white/80",
  hourStyle: (color, _isDay, isCurrent) => ({
    background: isCurrent
      ? `linear-gradient(180deg, ${color}66, ${color}1f)`
      : "linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.55))",
    boxShadow: isCurrent ? `0 0 16px ${color}77, inset 0 0 0 1px ${color}99` : undefined,
  }),
  hourText: "text-gray-600",
  hourGlyph: "text-base sm:text-lg",
  hourGlyphStyle: (color) => ({ color, filter: "drop-shadow(0 0 4px rgb(255 255 255 / 0.9))" }),
  rail: "border-gray-300",
  connector: "bg-rose-300",
  tick: "bg-rose-400",
  marker:
    "rounded-full border border-white text-lg shadow-[0_2px_12px_rgb(0_0_0/0.12)] backdrop-blur transition hover:border-gray-400 hover:shadow-[0_2px_18px_rgb(0_0_0/0.2)]",
  markerStyle: (color) => ({
    color,
    background: "linear-gradient(145deg, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.55))",
  }),
  chip: "border-gray-200 bg-white/80 text-gray-700",
  empty: "text-gray-500",
  nowLine: "border-rose-400 shadow-[0_0_10px_rgb(251_113_133/0.7)]",
  nowLabel: "bg-rose-500 text-white",
};

export const ASCENDANT_STYLES: Record<AscendantLook, AscendantStyle> = { dark, light };
