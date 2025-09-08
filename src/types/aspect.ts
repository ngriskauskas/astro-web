import { type Planet } from "./planet";

export const Aspects = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "✶",
  quincunx: "⚻",
  semiSextile: "⚺",
  sesquiquadrate: "⚼",
  semiSquare: "☐",
};

export interface Aspect {
  type: AspectType;
  angle: number;
  orb: number;
  planet1: Planet;
  planet2: Planet;
}
export type AspectType =
  | "conjunction"
  | "opposition"
  | "square"
  | "trine"
  | "sextile";
