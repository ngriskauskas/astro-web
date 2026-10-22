import type { PlanetName } from "./planet";
import type { ZodiacSign } from "./zodiac";

// The shapes planets make together in one chart, as the server sends them.
export type AspectPatternType =
  | "GRAND_TRINE"
  | "T_SQUARE"
  | "YOD"
  | "KITE"
  | "GRAND_CROSS"
  | "MYSTIC_RECTANGLE"
  | "GRAND_SEXTILE"
  | "STELLIUM"
  | "CONJUNCTION_CLUSTER";

export interface AspectPattern {
  type: AspectPatternType;
  // Every planet in the shape.
  planets: PlanetName[];
  // The planets a T-square or yod points at, where the other planets push towards. Empty otherwise.
  focus: PlanetName[];
  // The sign a stellium sits in.
  sign: ZodiacSign | null;
}

interface AspectPatternInfo {
  name: string;
  color: string;
  // A short, plain reading of the shape. It describes the shape only, not what will happen.
  description: string;
}

export const AspectPatternData: Record<AspectPatternType, AspectPatternInfo> = {
  GRAND_TRINE: {
    name: "Grand trine",
    color: "#3B82F6",
    description:
      "Three planets in trine form a triangle of ease. Their energy flows between them, so this often shows as a natural gift that comes without strain.",
  },
  T_SQUARE: {
    name: "T-square",
    color: "#F97316",
    description:
      "Two planets in opposition are both squared by a third. The tension has nowhere to rest, so the focal planet is where it tends to find an outlet.",
  },
  STELLIUM: {
    name: "Stellium",
    color: "#8B5CF6",
    description:
      "Three or more planets in one sign concentrate their themes there, so that sign's concerns run through much of the chart.",
  },
  YOD: {
    name: "Yod",
    color: "#14B8A6",
    description:
      "Two planets in sextile are both quincunx a third. The quincunxes ask for an adjustment, and the focal planet is where that adjustment is asked of you.",
  },
  KITE: {
    name: "Kite",
    color: "#22C55E",
    description:
      "A grand trine with a fourth planet opposite one of its corners and sextile the other two. The opposing planet is the focus: it gives the trine a point to work through.",
  },
  GRAND_CROSS: {
    name: "Grand cross",
    color: "#EF4444",
    description:
      "Four planets in two crossing oppositions, each squaring its neighbours. Tension runs in every direction at once, so the shape asks for balance between competing demands.",
  },
  MYSTIC_RECTANGLE: {
    name: "Mystic rectangle",
    color: "#6366F1",
    description:
      "Two oppositions joined round by sextiles and trines. The easy trines and the sextile openings sit alongside the oppositions, so the tension is held and worked with.",
  },
  GRAND_SEXTILE: {
    name: "Grand sextile",
    color: "#EAB308",
    description:
      "Six planets in a hexagon of sextiles, trines and oppositions. Each planet is linked to the others, so the chart's energies are woven together rather than sorted into separate groups.",
  },
  CONJUNCTION_CLUSTER: {
    name: "Conjunction cluster",
    color: "#EC4899",
    description:
      "Three or more planets joined by conjunctions gather into one concentrated point. Their themes are fused, so they are read together rather than one at a time.",
  },
};

// What the drawer for one shape needs: the shape, and which side of a two-chart view it is on.
export interface AspectPatternDescriptionValue {
  pattern: AspectPattern;
  owner?: "main" | "other";
}
