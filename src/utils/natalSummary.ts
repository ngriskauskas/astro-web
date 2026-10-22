import { isPlanetAspect, type Aspect, type PlanetAspect } from "../types/aspect";
import type { PlanetName } from "../types/planet";
import type { CuspType, KeyType } from "../types/cusp";
import { ZodiacData, type ZodiacSign } from "../types/zodiac";

// The angles that frame a chart: the Ascendant and the Midheaven. They are counted with the
// planets in a balance of elements or modalities, which makes twelve placements in all.
export const CORE_ANGLES: readonly KeyType[] = ["ASC", "MC"];

// The planets a chart reading counts. Nodes, Chiron and Lilith are points, not planets.
export const CORE_PLANETS: readonly PlanetName[] = [
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
];

export interface Tally {
  name: string;
  count: number;
}

// How many of the given signs fall in each element or modality, most common first.
export const tallyBy = (
  signs: readonly ZodiacSign[],
  key: (sign: ZodiacSign) => string,
): Tally[] => {
  const counts = new Map<string, number>();
  for (const sign of signs) {
    const name = key(sign);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

export const elementTally = (signs: readonly ZodiacSign[]) =>
  tallyBy(signs, (sign) => ZodiacData[sign].info.element.name);

export const modalityTally = (signs: readonly ZodiacSign[]) =>
  tallyBy(signs, (sign) => ZodiacData[sign].info.modality.name);

// The planet-to-planet aspects with the smallest orbs: the ones that matter most in a chart.
export const tightestPlanetAspects = (aspects: readonly Aspect[], limit: number): PlanetAspect[] =>
  aspects
    .filter(isPlanetAspect)
    .slice()
    .sort((left, right) => left.orb - right.orb)
    .slice(0, limit);

export type Dignity = "ruling" | "exalted" | "detriment" | "fall";

// Where a planet is strong or weak in a sign. Empty means it is neither (peregrine).
// Each dignity has its own colour, the same way signs and planets do.
export const DIGNITY: Record<Dignity, { text: string; color: string }> = {
  ruling: { text: "Rules this sign", color: "#4f46e5" },
  exalted: { text: "Exalted here", color: "#c08a2b" },
  detriment: { text: "In detriment", color: "#be123c" },
  fall: { text: "In fall", color: "#6b7280" },
};

export const dignitiesOf = (planet: PlanetName, sign: ZodiacSign): Dignity[] => {
  const { rulers, exalted, detriment, fall } = ZodiacData[sign].info;
  const dignities: Dignity[] = [];
  if (rulers.includes(planet)) dignities.push("ruling");
  if (exalted.includes(planet)) dignities.push("exalted");
  if (detriment.includes(planet)) dignities.push("detriment");
  if (fall.includes(planet)) dignities.push("fall");
  return dignities;
};

// The houses split the chart two ways. The Ascendant to Descendant line is the horizon: houses
// 7 to 12 are above it. The Midheaven to IC line divides east from west: houses 10 to 12 and 1
// to 3 are east. Each quarter of the chart is three houses, from one angle to the next.
export type Quadrant = 1 | 2 | 3 | 4;

export const quadrantOf = (house: CuspType): Quadrant => {
  if (house <= 3) return 1;
  if (house <= 6) return 2;
  if (house <= 9) return 3;
  return 4;
};

export const isAboveHorizon = (house: CuspType) => house >= 7;

export const isEast = (house: CuspType) => house >= 10 || house <= 3;

// Traditional house strength: a planet in an angular house acts most directly, one in a
// succedent house steadily, and one in a cadent house least of all.
export type HouseStrength = "angular" | "succedent" | "cadent";

export const houseStrengthOf = (house: CuspType): HouseStrength => {
  if (house % 3 === 1) return "angular";
  if (house % 3 === 2) return "succedent";
  return "cadent";
};

// Each planet's house of joy, the house where it is said to be at ease. Traditional list.
const JOY_HOUSE: Partial<Record<PlanetName, CuspType>> = {
  SUN: 9,
  MOON: 3,
  MERCURY: 1,
  VENUS: 5,
  MARS: 6,
  JUPITER: 11,
  SATURN: 12,
};

export const inJoy = (planet: PlanetName, house: CuspType) => JOY_HOUSE[planet] === house;
