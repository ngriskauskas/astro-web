import type { OwnerType } from "../contexts/MultiWheelContext";
import type { KeyAngleDisplay } from "./cusp";
import { type Planet, type PlanetBase } from "./planet";

export type AspectPointType = "Planet" | "Angle";

export interface Aspect {
  type: AspectType;
  angle: number;
  orb: number;
  point1: {
    type: AspectPointType;
    value: Planet;
  };
  point1Owner?: OwnerType;
  point2: {
    type: AspectPointType;
    value: Planet;
  };
}

export interface AspectDisplay {
  type: AspectType;
  orb?: number;
  point1: {
    type: AspectPointType;
    value: PlanetBase | KeyAngleDisplay;
  };
  point2: {
    type: AspectPointType;
    value: PlanetBase | KeyAngleDisplay;
  };
  point1Owner?: OwnerType;
}

export type AspectType = "CONJUNCTION" | "OPPOSITION" | "SQUARE" | "TRINE" | "SEXTILE";

interface AspectInfo {
  name: string;
  glyph: string;
  color: string;
  description: string;
}

export const AspectData: Record<AspectType, AspectInfo> = {
  CONJUNCTION: {
    name: "Conjunction",
    glyph: "☌",
    color: "#6B7280",
    description: "Merges the energies of both planets, intensifying their influence.",
  },
  OPPOSITION: {
    name: "Opposition",
    glyph: "☍",
    color: "#EF4444",
    description: "Creates tension and polarity, highlighting contrasts and challenges.",
  },
  SQUARE: {
    name: "Square",
    glyph: "□",
    color: "#F97316",
    description: "Generates friction that motivates growth and action.",
  },
  TRINE: {
    name: "Trine",
    glyph: "△",
    color: "#3B82F6",
    description: "Flows easily, bringing harmony and supportive energy.",
  },
  SEXTILE: {
    name: "Sextile",
    glyph: "✶",
    color: "#10B981",
    description: "Offers opportunity and cooperation, promoting positive outcomes.",
  },
};
