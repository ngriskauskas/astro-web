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

export type AspectType =
  | "conjunction"
  | "opposition"
  | "square"
  | "trine"
  | "sextile";

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

export interface Cusp {
  name: string;
  position: number;
  sign: ZodiacSign;
  deg_in_sign: number;
  deg_min: [number, number];
}

export interface Planet {
  name: PlanetName;
  position: number;
  sign: ZodiacSign;
  deg_in_sign: number;
  deg_min: [number, number];
  retrograde: boolean;
}

export interface Aspect {
  type: AspectType;
  angle: number;
  orb: number;
  planet1: Planet;
  planet2: Planet;
}

export const HOUSE_SYSTEMS = [
  "whole_sign",
  "placidus",
  "koch",
  "equal",
  "campanus",
  "regio",
] as const;
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];

export const ZODIAC_SYSTEMS = ["tropical", "sidereal"] as const;
export type ZodiacSystem = (typeof ZODIAC_SYSTEMS)[number];

export const AYANAMSAS = [
  "faganBradely",
  "lahiri",
  "deLuce",
  "raman",
  "ushaSashi",
  "krishnamurit",
  "djwhwalKhul",
  "yukteshwar",
] as const;
export type Ayanamsa = (typeof AYANAMSAS)[number];

