import { ElementData, type ElementInfo } from "./element";
import { ModalityData, type ModalityInfo } from "./modality";
import { PolarityData, type PolarityInfo } from "./polarity";
import type { Position } from "./position";
import { type ZodiacSign } from "./zodiac";

export type CuspType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Cusp {
  name: CuspType;
  position: Position;
  sign: ZodiacSign;
}

export type KeyType = "ASC" | "MC" | "IC" | "DC";

export interface KeyAngle {
  name: KeyType;
  position: Position;
  sign: ZodiacSign;
}

export interface KeyAngleDisplay {
  name: KeyType;
  sign: ZodiacSign;
}

interface AngleInfo {
  name: string;
  color: string;
  info: {
    description: string;
  };
}

export const AngleData: Record<KeyType, AngleInfo> = {
  ASC: {
    name: "Ascendant",
    color: "#E63946", // Aries-like red
    info: {
      description:
        "The rising sign. Represents outward personality, first impressions, and the way you initiate life experiences.",
    },
  },
  DC: {
    name: "Descendant",
    color: "#2A9D8F", // Libra-like green/teal
    info: {
      description:
        "Opposite the Ascendant. Governs partnerships, one-on-one relationships, and qualities sought in others.",
    },
  },
  MC: {
    name: "Midheaven",
    color: "#386b75", // Capricorn-like dark earthy tone
    info: {
      description:
        "The highest point in the chart. Symbolizes career, public image, reputation, and aspirations.",
    },
  },
  IC: {
    name: "Imum Coeli",
    color: "#457B9D", // Cancer-like deep blue
    info: {
      description:
        "The lowest point in the chart. Represents roots, ancestry, family, home life, and inner foundations.",
    },
  },
};

interface HouseInfo {
  name: string;
  color: string;
  info: {
    description: string;
    element: ElementInfo;
    modality: ModalityInfo;
    polarity: PolarityInfo;
    sign: ZodiacSign;
  };
}

export const HouseData: Record<CuspType, HouseInfo> = {
  1: {
    name: "1st House",
    color: ElementData["fire"].color,
    info: {
      description:
        "The house of self, identity, and appearance. Represents the way you present yourself to the world and approach new beginnings.",
      element: ElementData["fire"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["masculine"],
      sign: "ARIES",
    },
  },
  2: {
    name: "2nd House",
    color: ElementData["earth"].color,
    info: {
      description:
        "The house of resources, possessions, and values. Relates to personal finances, self-worth, and material stability.",
      element: ElementData["earth"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["feminine"],
      sign: "TAURUS",
    },
  },
  3: {
    name: "3rd House",
    color: ElementData["air"].color,
    info: {
      description:
        "The house of communication, learning, and local environment. Governs thinking, speaking, siblings, and short journeys.",
      element: ElementData["air"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["masculine"],
      sign: "GEMINI",
    },
  },
  4: {
    name: "4th House",
    color: ElementData["water"].color,
    info: {
      description:
        "The house of home, family, and roots. Relates to emotional foundations, ancestry, and your private inner life.",
      element: ElementData["water"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["feminine"],
      sign: "CANCER",
    },
  },
  5: {
    name: "5th House",
    color: ElementData["fire"].color,
    info: {
      description:
        "The house of creativity, romance, and pleasure. Represents self-expression, joy, children, and artistic pursuits.",
      element: ElementData["fire"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["masculine"],
      sign: "LEO",
    },
  },
  6: {
    name: "6th House",
    color: ElementData["earth"].color,
    info: {
      description:
        "The house of health, service, and daily routines. Governs habits, work environment, and care for mind and body.",
      element: ElementData["earth"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["feminine"],
      sign: "VIRGO",
    },
  },
  7: {
    name: "7th House",
    color: ElementData["air"].color,
    info: {
      description:
        "The house of partnerships and one-on-one relationships. Relates to marriage, contracts, and how you connect with others.",
      element: ElementData["air"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["masculine"],
      sign: "LIBRA",
    },
  },
  8: {
    name: "8th House",
    color: ElementData["water"].color,
    info: {
      description:
        "The house of transformation, intimacy, and shared resources. Associated with power, sexuality, inheritance, and rebirth.",
      element: ElementData["water"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["feminine"],
      sign: "SCORPIO",
    },
  },
  9: {
    name: "9th House",
    color: ElementData["fire"].color,
    info: {
      description:
        "The house of philosophy, higher learning, and exploration. Governs travel, spirituality, and the search for truth and wisdom.",
      element: ElementData["fire"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["masculine"],
      sign: "SAGITTARIUS",
    },
  },
  10: {
    name: "10th House",
    color: ElementData["earth"].color,
    info: {
      description:
        "The house of career, public image, and achievement. Represents ambition, authority, and your legacy in society.",
      element: ElementData["earth"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["feminine"],
      sign: "CAPRICORN",
    },
  },
  11: {
    name: "11th House",
    color: ElementData["air"].color,
    info: {
      description:
        "The house of friendships, groups, and aspirations. Associated with community, social causes, and future-oriented goals.",
      element: ElementData["air"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["masculine"],
      sign: "AQUARIUS",
    },
  },
  12: {
    name: "12th House",
    color: ElementData["water"].color,
    info: {
      description:
        "The house of spirituality, the subconscious, and endings. Governs dreams, solitude, hidden matters, and transcendence.",
      element: ElementData["water"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["feminine"],
      sign: "PISCES",
    },
  },
};
