import { type PlanetName, type ZodiacSign } from "../contexts/ChartContext";
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
// @ts-ignore
import SunSvg from "../assets/planets/Sun.svg";
import MoonSvg from "../assets/planets/Moon.svg";
import MercurySvg from "../assets/planets/Mercury.svg";
import VenusSvg from "../assets/planets/Venus.svg";
import MarsSvg from "../assets/planets/Mars.svg";
import JupiterSvg from "../assets/planets/Jupiter.svg";
import SaturnSvg from "../assets/planets/Saturn.svg";
import UranusSvg from "../assets/planets/Uranus.svg";
import NeptuneSvg from "../assets/planets/Neptune.svg";
import PlutoSvg from "../assets/planets/Pluto.svg";
import ChironSvg from "../assets/planets/Chiron.svg";
import LilithSvg from "../assets/planets/Black_Moon_Lilith.svg";
import NorthNodeSvg from "../assets/planets/Ascending_node.svg";
import SouthNodeSvg from "../assets/planets/Descending_node.svg";

interface ZodiacInfo {
  glyph: string;
  color: string;
}
export type Element = "fire" | "water" | "air" | "earth";
export const ElementColors: Record<Element, string> = {
  fire: "#FF6F61",
  water: "#20B2AA",
  air: "#92A8D1",
  earth: "#556B2F",
};

export const ZodiacData: Record<ZodiacSign, ZodiacInfo> = {
  aries: { glyph: AriesSvg, color: ElementColors["fire"] },
  taurus: { glyph: TaurusSvg, color: ElementColors["earth"] },
  gemini: { glyph: GeminiSvg, color: ElementColors["air"] },
  cancer: { glyph: CancerSvg, color: ElementColors["water"] },
  leo: { glyph: LeoSvg, color: ElementColors["fire"] },
  virgo: { glyph: VirgoSvg, color: ElementColors["earth"] },
  libra: { glyph: LibraSvg, color: ElementColors["air"] },
  scorpio: { glyph: ScorpioSvg, color: ElementColors["water"] },
  sagittarius: { glyph: SagittariusSvg, color: ElementColors["fire"] },
  capricorn: { glyph: CapricornSvg, color: ElementColors["earth"] },
  aquarius: { glyph: AquariusSvg, color: ElementColors["air"] },
  pisces: { glyph: PiscesSvg, color: ElementColors["water"] },
};

interface PlanetInfo {
  glyph: string;
  scale: number;
  isSvg?: boolean;
}

export const PlanetsData: Record<PlanetName, PlanetInfo> = {
  Sun: { glyph: "☉", scale: 1.15 },
  Moon: { glyph: "☽", scale: 1 },
  Mercury: { glyph: "☿", scale: 1.1 },
  Venus: { glyph: "♀", scale: 1.2 },
  Mars: { glyph: "♂", scale: 1.3 },
  Jupiter: { glyph: "♃", scale: 1 },
  Saturn: { glyph: "♄", scale: 1 },
  Uranus: { glyph: "♅", scale: 1 },
  Neptune: { glyph: "♆", scale: 1 },
  Pluto: { glyph: "♇", scale: 1 },
  Chiron: { glyph: "⚷", scale: 1.2 },
  "mean Apogee": { glyph: "⚸", scale: 1.3 },
  "true Node": { glyph: "☊", scale: 0.95 },
  "osc. Apogee": { glyph: "⚸", scale: 1.3 },
  "South Node": { glyph: "☋", scale: 0.95 },
};

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
