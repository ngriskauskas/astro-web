import AriesSvg from "../assets/signs/normal_symbols/Aries.svg";
import TaurusSvg from "../assets/signs/normal_symbols/Taurus.svg";
import GeminiSvg from "../assets/signs/normal_symbols/Gemini.svg";
import CancerSvg from "../assets/signs/normal_symbols/Cancer.svg";
import LeoSvg from "../assets/signs/normal_symbols/Leo.svg";
import VirgoSvg from "../assets/signs/normal_symbols/Virgo.svg";
import LibraSvg from "../assets/signs/normal_symbols/Libra.svg";
import ScorpioSvg from "../assets/signs/normal_symbols/Scorpio.svg";
import SagittariusSvg from "../assets/signs/normal_symbols/Sagittarius.svg";
import CapricornSvg from "../assets/signs/normal_symbols/Capricorn.svg";
import AquariusSvg from "../assets/signs/normal_symbols/Aquarius.svg";
import PiscesSvg from "../assets/signs/normal_symbols/Pisces.svg";
import AriesDrawing from "../assets/signs/drawings/aries.svg";
import TaurusDrawing from "../assets/signs/drawings/taurus.svg";
import GeminiDrawing from "../assets/signs/drawings/gemini.svg";
import CancerDrawing from "../assets/signs/drawings/cancer.svg";
import LeoDrawing from "../assets/signs/drawings/leo.svg";
import VirgoDrawing from "../assets/signs/drawings/virgo.svg";
import LibraDrawing from "../assets/signs/drawings/libra.svg";
import ScorpioDrawing from "../assets/signs/drawings/scorpio.svg";
import SagittariusDrawing from "../assets/signs/drawings/sagittarius.svg";
import CapricornDrawing from "../assets/signs/drawings/capricorn.svg";
import AquariusDrawing from "../assets/signs/drawings/aquarius.svg";
import PiscesDrawing from "../assets/signs/drawings/pisces.svg";
import { ElementData, type ElementInfo } from "./element";
import { ModalityData, type ModalityInfo } from "./modality";
import { PolarityData, type PolarityInfo } from "./polarity";
import { type PlanetName } from "./planet";

export const ZodiacSigns = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

interface ZodiacInfo {
  glyph: string;
  color: string;
  drawing: string;
  info: {
    description: string;
    element: ElementInfo;
    modality: ModalityInfo;
    polarity: PolarityInfo;
    house: number;
    rulers: PlanetName[];
    exalted: PlanetName[];
    detriment: PlanetName[];
    fall: PlanetName[];
  };
}

export const ZodiacData: Record<ZodiacSign, ZodiacInfo> = {
  aries: {
    glyph: AriesSvg,
    color: ElementData["fire"].color,
    drawing: AriesDrawing,
    info: {
      description:
        "Energetic and driven, always ready to take initiative, with a boldness that inspires others and a natural competitive streak.",
      element: ElementData["fire"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["masculine"],
      house: 1,
      rulers: ["mars"],
      exalted: ["sun"],
      detriment: ["venus"],
      fall: ["saturn"],
    },
  },
  taurus: {
    glyph: TaurusSvg,
    color: ElementData["earth"].color,
    drawing: TaurusDrawing,
    info: {
      description:
        "Steady and patient, with a strong sense of practicality, an appreciation for beauty, and a desire for security in all aspects of life.",
      element: ElementData["earth"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["feminine"],
      house: 2,
      rulers: ["venus"],
      exalted: ["moon"],
      detriment: ["mars"],
      fall: ["uranus"],
    },
  },
  gemini: {
    glyph: GeminiSvg,
    color: ElementData["air"].color,
    drawing: GeminiDrawing,
    info: {
      description:
        "Curious and adaptable, with a quick mind, a gift for communication, and a love of learning and exploring new ideas.",
      element: ElementData["air"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["masculine"],
      house: 3,
      rulers: ["mercury"],
      exalted: [],
      detriment: ["jupiter"],
      fall: [],
    },
  },
  cancer: {
    glyph: CancerSvg,
    color: ElementData["water"].color,
    drawing: CancerDrawing,
    info: {
      description:
        "Nurturing and intuitive, deeply empathetic with others, protective of loved ones, and guided by strong emotional intelligence.",
      element: ElementData["water"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["feminine"],
      house: 4,
      rulers: ["moon"],
      exalted: ["jupiter"],
      detriment: ["saturn"],
      fall: ["mars"],
    },
  },
  leo: {
    glyph: LeoSvg,
    color: ElementData["fire"].color,
    drawing: LeoDrawing,
    info: {
      description:
        "Charismatic and confident, with a natural flair for leadership, creativity, and a desire to inspire admiration and respect from others.",
      element: ElementData["fire"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["masculine"],
      house: 5,
      rulers: ["sun"],
      exalted: ["neptune", "sun"],
      detriment: ["saturn"],
      fall: ["uranus"],
    },
  },
  virgo: {
    glyph: VirgoSvg,
    color: ElementData["earth"].color,
    drawing: VirgoDrawing,
    info: {
      description:
        "Analytical and meticulous, highly practical, detail-oriented, and motivated by a desire to improve systems and help others in tangible ways.",
      element: ElementData["earth"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["feminine"],
      house: 6,
      rulers: ["mercury"],
      exalted: ["mercury"],
      detriment: ["jupiter"],
      fall: [],
    },
  },
  libra: {
    glyph: LibraSvg,
    color: ElementData["air"].color,
    drawing: LibraDrawing,
    info: {
      description:
        "Diplomatic and gracious, with a strong sense of fairness, a love for beauty and harmony, and skill in balancing multiple perspectives.",
      element: ElementData["air"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["masculine"],
      house: 7,
      rulers: ["venus"],
      exalted: ["saturn"],
      detriment: ["mars"],
      fall: ["sun"],
    },
  },
  scorpio: {
    glyph: ScorpioSvg,
    color: ElementData["water"].color,
    drawing: ScorpioDrawing,
    info: {
      description:
        "Intense and perceptive, emotionally deep, highly determined, and drawn to transformation, mystery, and uncovering hidden truths.",
      element: ElementData["water"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["feminine"],
      house: 8,
      rulers: ["mars", "pluto"],
      exalted: ["uranus", "neptune"],
      detriment: ["venus"],
      fall: ["moon"],
    },
  },
  sagittarius: {
    glyph: SagittariusSvg,
    color: ElementData["fire"].color,
    drawing: SagittariusDrawing,
    info: {
      description:
        "Adventurous and optimistic, drawn to exploration, learning, philosophy, and seeking freedom while inspiring others with enthusiasm.",
      element: ElementData["fire"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["masculine"],
      house: 9,
      rulers: ["jupiter"],
      exalted: ["moon"],
      detriment: ["mercury"],
      fall: ["venus"],
    },
  },
  capricorn: {
    glyph: CapricornSvg,
    color: ElementData["earth"].color,
    drawing: CapricornDrawing,
    info: {
      description:
        "Disciplined and responsible, ambitious and patient, with a strong focus on structure, long-term goals, and practical achievement.",
      element: ElementData["earth"],
      modality: ModalityData["cardinal"],
      polarity: PolarityData["feminine"],
      house: 10,
      rulers: ["saturn"],
      exalted: ["mars"],
      detriment: ["moon"],
      fall: ["jupiter"],
    },
  },
  aquarius: {
    glyph: AquariusSvg,
    color: ElementData["air"].color,
    drawing: AquariusDrawing,
    info: {
      description:
        "Innovative and independent, humanitarian-minded, inventive, and focused on ideas that can improve society and challenge tradition.",
      element: ElementData["air"],
      modality: ModalityData["fixed"],
      polarity: PolarityData["masculine"],
      house: 11,
      rulers: ["saturn", "uranus"],
      exalted: [],
      detriment: ["sun"],
      fall: ["mercury"],
    },
  },
  pisces: {
    glyph: PiscesSvg,
    color: ElementData["water"].color,
    drawing: PiscesDrawing,
    info: {
      description:
        "Empathetic and intuitive, imaginative, compassionate, and often deeply connected to the emotional and spiritual realms.",
      element: ElementData["water"],
      modality: ModalityData["mutable"],
      polarity: PolarityData["feminine"],
      house: 12,
      rulers: ["jupiter", "neptune"],
      exalted: ["venus"],
      detriment: ["mercury"],
      fall: ["mars"],
    },
  },
};
