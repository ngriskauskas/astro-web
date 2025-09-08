import { type ZodiacSign } from "./zodiac";

export type PlanetName =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "chiron"
  | "north node"
  | "south node"
  | "lilith";

export interface Planet {
  name: PlanetName;
  position: number;
  sign: ZodiacSign;
  deg_in_sign: number;
  deg_min: [number, number];
  retrograde: boolean;
}

interface PlanetInfo {
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
  sun: {
    glyph: "☉",
    scale: 1.15,
    color: "#FFD700",
    info: {
      description:
        "Represents core identity, vitality, creativity, and self-expression, driving personal purpose and ambition.",
      rulerships: ["leo"],
      exaltedIn: ["aries"],
      detrimentIn: ["aquarius"],
      fallIn: ["libra"],
    },
  },
  moon: {
    glyph: "☽",
    scale: 1,
    color: "#B0C4DE",
    info: {
      description:
        "Symbolizes emotions, intuition, instincts, and nurturing qualities, shaping inner life and personal comfort.",
      rulerships: ["cancer"],
      exaltedIn: ["taurus"],
      detrimentIn: ["capricorn"],
      fallIn: ["scorpio"],
    },
  },
  mercury: {
    glyph: "☿",
    scale: 1.1,
    color: "#9ACD32",
    info: {
      description:
        "Represents communication, intellect, reasoning, and adaptability, governing learning and social interaction.",
      rulerships: ["gemini", "virgo"],
      exaltedIn: ["virgo"],
      detrimentIn: ["sagittarius", "pisces"],
      fallIn: ["pisces"],
    },
  },
  venus: {
    glyph: "♀",
    scale: 1.2,
    color: "#FF69B4",
    info: {
      description:
        "Represents love, beauty, harmony, relationships, and aesthetic sensibilities, influencing pleasure and values.",
      rulerships: ["taurus", "libra"],
      exaltedIn: ["pisces"],
      detrimentIn: ["scorpio", "aries"],
      fallIn: ["virgo"],
    },
  },
  mars: {
    glyph: "♂",
    scale: 1.3,
    color: "#FF4500",
    info: {
      description:
        "Symbolizes energy, drive, assertion, and courage, powering ambition, action, and the pursuit of goals.",
      rulerships: ["aries", "scorpio"],
      exaltedIn: ["capricorn"],
      detrimentIn: ["taurus", "libra"],
      fallIn: ["cancer"],
    },
  },
  jupiter: {
    glyph: "♃",
    scale: 1,
    color: "#F4A460",
    info: {
      description:
        "Represents growth, expansion, optimism, and higher learning, governing philosophy, travel, and opportunity.",
      rulerships: ["sagittarius", "pisces"],
      exaltedIn: ["cancer"],
      detrimentIn: ["gemini", "virgo"],
      fallIn: ["capricorn"],
    },
  },
  saturn: {
    glyph: "♄",
    scale: 1,
    color: "#708090",
    info: {
      description:
        "Represents discipline, structure, responsibility, and limitation, governing long-term planning and maturity.",
      rulerships: ["capricorn", "aquarius"],
      exaltedIn: ["libra"],
      detrimentIn: ["cancer", "leo"],
      fallIn: ["aries"],
    },
  },
  uranus: {
    glyph: "♅",
    scale: 1,
    color: "#40E0D0",
    info: {
      description:
        "Represents innovation, rebellion, and sudden change, governing individuality, technology, and progressive thought.",
      rulerships: ["aquarius"],
      exaltedIn: ["scorpio"],
      detrimentIn: ["leo"],
      fallIn: ["taurus"],
    },
  },
  neptune: {
    glyph: "♆",
    scale: 1,
    color: "#4682B4",
    info: {
      description:
        "Represents dreams, intuition, spirituality, and illusion, influencing imagination, empathy, and creativity.",
      rulerships: ["pisces"],
      exaltedIn: ["cancer"],
      detrimentIn: ["virgo"],
      fallIn: ["capricorn"],
    },
  },
  pluto: {
    glyph: "♇",
    scale: 1,
    color: "#8B0000",
    info: {
      description:
        "Represents transformation, power, intensity, and regeneration, governing endings, rebirth, and deep psychological insight.",
      rulerships: ["scorpio"],
      exaltedIn: ["cancer"],
      detrimentIn: ["virgo"],
      fallIn: ["capricorn"],
    },
  },
  chiron: {
    glyph: "⚷",
    scale: 1.2,
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
  lilith: {
    glyph: "⚸",
    scale: 1.3,
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
  "north node": {
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
  "south node": {
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
