import type { CuspType } from "./cusp";
import type { Position } from "./position";
import { type ZodiacSign } from "./zodiac";

export type PlanetName =
  | "SUN"
  | "MOON"
  | "MERCURY"
  | "VENUS"
  | "MARS"
  | "JUPITER"
  | "SATURN"
  | "URANUS"
  | "NEPTUNE"
  | "PLUTO"
  | "CHIRON"
  | "NORTH_NODE"
  | "SOUTH_NODE"
  | "LILITH";

export const PLANET_ORDER = [
  "SUN",
  "MOON",
  "MERCURY",
  "VENUS",
  "MARS",
  "JUPITER",
  "SATURN",
  "URANUS",
  "NEPTUNE",
  "PLUTO",
  "CHIRON",
  "NORTH_NODE",
  "SOUTH_NODE",
  "LILITH",
] as const;

export interface Planet {
  name: PlanetName;
  position: Position;
  sign: ZodiacSign;
  retrograde: boolean;
  house: CuspType;
  stationary: boolean;
  speed: number;
}

export interface PlanetBase {
  name: PlanetName;
  sign: ZodiacSign;
}

interface PlanetInfo {
  displayName: string;
  glyph: string;
  scale: number;
  color: string;
  info: {
    description: string;
    rulerships: ZodiacSign[];
    exaltedIn: ZodiacSign[];
    detrimentIn: ZodiacSign[];
    fallIn: ZodiacSign[];
  };
}

export const PlanetsData: Record<PlanetName, PlanetInfo> = {
  SUN: {
    displayName: "Sun",
    glyph: "☉",
    scale: 1.5,
    color: "#FFD700",
    info: {
      description:
        "Represents core identity, vitality, creativity, and self-expression, driving personal purpose and ambition.",
      rulerships: ["LEO"],
      exaltedIn: ["ARIES"],
      detrimentIn: ["AQUARIUS"],
      fallIn: ["LIBRA"],
    },
  },
  MOON: {
    displayName: "Moon",
    glyph: "☽",
    scale: 1,
    color: "#B0C4DE",
    info: {
      description:
        "Symbolizes emotions, intuition, instincts, and nurturing qualities, shaping inner life and personal comfort.",
      rulerships: ["CANCER"],
      exaltedIn: ["TAURUS"],
      detrimentIn: ["CAPRICORN"],
      fallIn: ["SCORPIO"],
    },
  },
  MERCURY: {
    displayName: "Mercury",
    glyph: "☿",
    scale: 1.1,
    color: "#9ACD32",
    info: {
      description:
        "Represents communication, intellect, reasoning, and adaptability, governing learning and social interaction.",
      rulerships: ["GEMINI", "VIRGO"],
      exaltedIn: ["VIRGO"],
      detrimentIn: ["SAGITTARIUS", "PISCES"],
      fallIn: ["PISCES"],
    },
  },
  VENUS: {
    displayName: "Venus",
    glyph: "♀",
    scale: 0.95,
    color: "#FF69B4",
    info: {
      description:
        "Represents love, beauty, harmony, relationships, and aesthetic sensibilities, influencing pleasure and values.",
      rulerships: ["TAURUS", "LIBRA"],
      exaltedIn: ["PISCES"],
      detrimentIn: ["SCORPIO", "ARIES"],
      fallIn: ["VIRGO"],
    },
  },
  MARS: {
    displayName: "Mars",
    glyph: "♂",
    scale: 0.9,
    color: "#FF4500",
    info: {
      description:
        "Symbolizes energy, drive, assertion, and courage, powering ambition, action, and the pursuit of goals.",
      rulerships: ["ARIES", "SCORPIO"],
      exaltedIn: ["CAPRICORN"],
      detrimentIn: ["TAURUS", "LIBRA"],
      fallIn: ["CANCER"],
    },
  },
  JUPITER: {
    displayName: "Jupiter",
    glyph: "♃",
    scale: 1,
    color: "#F4A460",
    info: {
      description:
        "Represents growth, expansion, optimism, and higher learning, governing philosophy, travel, and opportunity.",
      rulerships: ["SAGITTARIUS", "PISCES"],
      exaltedIn: ["CANCER"],
      detrimentIn: ["GEMINI", "VIRGO"],
      fallIn: ["CAPRICORN"],
    },
  },
  SATURN: {
    displayName: "Saturn",
    glyph: "♄",
    scale: 1,
    color: "#708090",
    info: {
      description:
        "Represents discipline, structure, responsibility, and limitation, governing long-term planning and maturity.",
      rulerships: ["CAPRICORN", "AQUARIUS"],
      exaltedIn: ["LIBRA"],
      detrimentIn: ["CANCER", "LEO"],
      fallIn: ["ARIES"],
    },
  },
  URANUS: {
    displayName: "Uranus",
    glyph: "♅",
    scale: 1,
    color: "#40E0D0",
    info: {
      description:
        "Represents innovation, rebellion, and sudden change, governing individuality, technology, and progressive thought.",
      rulerships: ["AQUARIUS"],
      exaltedIn: ["SCORPIO"],
      detrimentIn: ["LEO"],
      fallIn: ["TAURUS"],
    },
  },
  NEPTUNE: {
    displayName: "Neptune",
    glyph: "♆",
    scale: 1,
    color: "#4682B4",
    info: {
      description:
        "Represents dreams, intuition, spirituality, and illusion, influencing imagination, empathy, and creativity.",
      rulerships: ["PISCES"],
      exaltedIn: ["CANCER"],
      detrimentIn: ["VIRGO"],
      fallIn: ["CAPRICORN"],
    },
  },
  PLUTO: {
    displayName: "Pluto",
    glyph: "♇",
    scale: 1,
    color: "#8B0000",
    info: {
      description:
        "Represents transformation, power, intensity, and regeneration, governing endings, rebirth, and deep psychological insight.",
      rulerships: ["SCORPIO"],
      exaltedIn: ["CANCER"],
      detrimentIn: ["VIRGO"],
      fallIn: ["CAPRICORN"],
    },
  },
  CHIRON: {
    displayName: "Chiron",
    glyph: "⚷",
    scale: 1,
    color: "#8A2BE2",
    info: {
      description:
        "Represents healing, wounds, and personal growth, highlighting where learning comes through vulnerability and recovery.",
      rulerships: [],
      exaltedIn: [],
      detrimentIn: [],
      fallIn: [],
    },
  },
  LILITH: {
    displayName: "Lilith",
    glyph: "⚸",
    scale: 1,
    color: "#800080",
    info: {
      description:
        "Represents shadow aspects, rebellion, and untamed energy, highlighting hidden desires and areas of empowerment.",
      rulerships: [],
      exaltedIn: [],
      detrimentIn: [],
      fallIn: [],
    },
  },
  NORTH_NODE: {
    displayName: "North Node",
    glyph: "☊",
    scale: 0.95,
    color: "#32CD32",
    info: {
      description:
        "Represents karmic growth, life lessons, and the path forward, guiding personal development and purpose.",
      rulerships: [],
      exaltedIn: [],
      detrimentIn: [],
      fallIn: [],
    },
  },
  SOUTH_NODE: {
    displayName: "South Node",
    glyph: "☋",
    scale: 0.95,
    color: "#FF6347",
    info: {
      description:
        "Represents past life patterns, comfort zones, and habitual tendencies, highlighting what must be released for growth.",
      rulerships: [],
      exaltedIn: [],
      detrimentIn: [],
      fallIn: [],
    },
  },
};
