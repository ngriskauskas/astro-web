import type { OwnerType } from "../contexts/MultiWheelContext";
import type { KeyAngle, KeyAngleDisplay } from "./cusp";
import { type Planet, type PlanetBase } from "./planet";

export type AspectPointType = "Planet" | "Angle";
export type AspectMotion = "APPLYING" | "SEPARATING";
export type AspectMotionState = AspectMotion | "EXACT";

export type AspectPoint = { type: "Planet"; value: Planet } | { type: "Angle"; value: KeyAngle };

export interface Aspect {
  type: AspectType;
  motion: AspectMotion;
  orb: number;
  point1: AspectPoint;
  point1Owner?: OwnerType;
  point2: AspectPoint;
}

export type PlanetAspect = Omit<Aspect, "point1" | "point2"> & {
  point1: { type: "Planet"; value: Planet };
  point2: { type: "Planet"; value: Planet };
};

export const isPlanetAspect = (aspect: Aspect): aspect is PlanetAspect =>
  aspect.point1.type === "Planet" && aspect.point2.type === "Planet";

export type AspectDisplayPoint =
  | { type: "Planet"; value: PlanetBase }
  | { type: "Angle"; value: KeyAngleDisplay };

export interface AspectDisplay {
  type: AspectType;
  orb?: number;
  motion?: AspectMotion;
  point1: AspectDisplayPoint;
  point2: AspectDisplayPoint;
  point1Owner?: OwnerType;
}

export type AspectType = "CONJUNCTION" | "OPPOSITION" | "SQUARE" | "TRINE" | "SEXTILE";

interface AspectInfo {
  name: string;
  glyph: string;
  color: string;
  description: string;
}

interface AspectMotionInfo {
  name: string;
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

export const AspectMotionData: Record<AspectMotionState, AspectMotionInfo> = {
  APPLYING: {
    name: "Applying",
    description:
      "The aspect is building as its points move toward exact alignment, making its influence more noticeable.",
  },
  EXACT: {
    name: "Exact",
    description:
      "The aspect is within 0.25° of exact alignment, bringing its themes into particularly sharp focus.",
  },
  SEPARATING: {
    name: "Separating",
    description:
      "The exact alignment has passed. Its influence may continue for a time while gradually easing.",
  },
};
