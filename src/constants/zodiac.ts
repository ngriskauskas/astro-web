import { type PlanetName, type ZodiacSign } from "../types/zodiac";
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
  fire: "#FF6347", // tomato red
  water: "#1EBDEB", // original
  air: "#92A8D1", // original
  earth: "#228B22", // original
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
  sun: { glyph: "☉", scale: 1.15 },
  moon: { glyph: "☽", scale: 1 },
  mercury: { glyph: "☿", scale: 1.1 },
  venus: { glyph: "♀", scale: 1.2 },
  mars: { glyph: "♂", scale: 1.3 },
  jupiter: { glyph: "♃", scale: 1 },
  saturn: { glyph: "♄", scale: 1 },
  uranus: { glyph: "♅", scale: 1 },
  neptune: { glyph: "♆", scale: 1 },
  pluto: { glyph: "♇", scale: 1 },
  chiron: { glyph: "⚷", scale: 1.2 },
  "north node": { glyph: "☊", scale: 0.95 },
  lilith: { glyph: "⚸", scale: 1.3 },
  "south node": { glyph: "☋", scale: 0.95 },
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
