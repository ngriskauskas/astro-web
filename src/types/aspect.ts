import type { OwnerType } from "../contexts/MultiWheelContext";
import type { KeyAngleDisplay } from "./cusp";
import { type Planet, type PlanetBase } from "./planet";

export interface Aspect {
  type: AspectType;
  angle: number;
  orb: number;
  planet1: Planet;
  planet1Owner?: OwnerType;
  planet2: Planet;
}

export interface AspectDisplay {
  type: AspectType;
  orb?: number;
  planet1: PlanetBase | KeyAngleDisplay;
  planet2: PlanetBase | KeyAngleDisplay;
  planet1Owner?: OwnerType;
}

export type AspectType =
  | "conjunction"
  | "opposition"
  | "square"
  | "trine"
  | "sextile";

interface AspectInfo {
  name: string;
  glyph: string;
  color: string;
  description: string;
}

export const AspectData: Record<AspectType, AspectInfo> = {
  conjunction: {
    name: "Conjunction",
    glyph: "☌",
    color: "#6B7280",
    description:
      "Merges the energies of both planets, intensifying their influence.",
  },
  opposition: {
    name: "Opposition",
    glyph: "☍",
    color: "#EF4444",
    description:
      "Creates tension and polarity, highlighting contrasts and challenges.",
  },
  square: {
    name: "Square",
    glyph: "□",
    color: "#F97316",
    description: "Generates friction that motivates growth and action.",
  },
  trine: {
    name: "Trine",
    glyph: "△",
    color: "#3B82F6",
    description: "Flows easily, bringing harmony and supportive energy.",
  },
  sextile: {
    name: "Sextile",
    glyph: "✶",
    color: "#10B981",
    description:
      "Offers opportunity and cooperation, promoting positive outcomes.",
  },
};
