import type { Aspect, AspectMotion, AspectPoint, AspectType } from "../../src/types/aspect";
import type { MultiChart, SingleChart } from "../../src/types/chart";
import type { Cusp, CuspType, KeyAngle, KeyType } from "../../src/types/cusp";
import type { Planet, PlanetName } from "../../src/types/planet";
import type { Position } from "../../src/types/position";
import type { ZodiacSign } from "../../src/types/zodiac";

// Chart fixtures are built from zodiac longitudes (0 = 0° Aries) so every position,
// sign and house in a chart agrees with the others. The arithmetic is on fixed
// literals: nothing depends on the clock or on random values.
//
// Aspects are listed by hand, as the backend would return them; they are not computed
// from the positions, and the tests only check that what is returned is what is shown.

// Kept local: importing the app's zodiac module would pull in its SVG assets, which
// the browser test runner cannot load.
const SIGNS: ZodiacSign[] = [
  "ARIES",
  "TAURUS",
  "GEMINI",
  "CANCER",
  "LEO",
  "VIRGO",
  "LIBRA",
  "SCORPIO",
  "SAGITTARIUS",
  "CAPRICORN",
  "AQUARIUS",
  "PISCES",
];

const norm = (longitude: number) => ((longitude % 360) + 360) % 360;

export const signOf = (longitude: number) => SIGNS[Math.floor(norm(longitude) / 30)];

export const position = (longitude: number): Position => {
  const degInSign = Math.round((norm(longitude) % 30) * 100) / 100;
  const degrees = Math.floor(degInSign);
  return {
    position: norm(longitude),
    degInSign,
    degMin: [degrees, Math.round((degInSign - degrees) * 60)],
  };
};

const houses = (ascendant: number) =>
  Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => {
      const longitude = ascendant + index * 30;
      const cusp: Cusp = {
        name: (index + 1) as CuspType,
        position: position(longitude),
        sign: signOf(longitude),
      };
      return [index + 1, cusp];
    }),
  ) as Record<CuspType, Cusp>;

const keyAngles = (ascendant: number, midheaven: number) => {
  const angle = (name: KeyType, longitude: number): KeyAngle => ({
    name,
    position: position(longitude),
    sign: signOf(longitude),
  });
  return {
    ASC: angle("ASC", ascendant),
    DC: angle("DC", ascendant + 180),
    MC: angle("MC", midheaven),
    IC: angle("IC", midheaven + 180),
  } as Record<KeyType, KeyAngle>;
};

interface ChartSpec {
  ascendant: number;
  midheaven: number;
  planets: Record<PlanetName, number>;
  retrograde?: PlanetName[];
}

type ChartBody = Omit<SingleChart, "aspects">;

const body = ({ ascendant, midheaven, planets, retrograde = [] }: ChartSpec): ChartBody => ({
  planets: Object.fromEntries(
    (Object.entries(planets) as [PlanetName, number][]).map(([name, longitude]) => {
      const planet: Planet = {
        name,
        position: position(longitude),
        sign: signOf(longitude),
        house: (Math.floor(norm(longitude - ascendant) / 30) + 1) as CuspType,
        retrograde: retrograde.includes(name),
        stationary: false,
        speed: 1,
      };
      return [name, planet];
    }),
  ) as Record<PlanetName, Planet>,
  houses: houses(ascendant),
  keyAngles: keyAngles(ascendant, midheaven),
});

type PointName = PlanetName | "ASC" | "MC" | "IC" | "DC";

const isAngle = (name: PointName): name is KeyType => ["ASC", "MC", "IC", "DC"].includes(name);

const point = (chart: ChartBody, name: PointName): AspectPoint =>
  isAngle(name)
    ? { type: "Angle", value: chart.keyAngles[name] }
    : { type: "Planet", value: chart.planets[name] };

const aspect = (
  type: AspectType,
  point1: AspectPoint,
  point2: AspectPoint,
  orb: number,
  motion: AspectMotion = "APPLYING",
): Aspect => ({ type, orb, motion, point1, point2 });

// The signed-in user's chart. Mercury is retrograde, Venus and Mars sit 2.5° apart,
// and the aspects include one to Chiron, one to Lilith, one to the Ascendant and one
// within 0.25° (shown as "Exact").
const natal = body({
  ascendant: 12.4,
  midheaven: 280,
  planets: {
    SUN: 54.5,
    MOON: 300.2,
    MERCURY: 40.1,
    VENUS: 340,
    MARS: 342.5,
    JUPITER: 100.3,
    SATURN: 295,
    URANUS: 279,
    NEPTUNE: 284.5,
    PLUTO: 226,
    CHIRON: 105,
    NORTH_NODE: 315,
    SOUTH_NODE: 135,
    LILITH: 200,
  },
  retrograde: ["MERCURY"],
});

export const natalChart: SingleChart = {
  ...natal,
  aspects: [
    aspect("TRINE", point(natal, "SUN"), point(natal, "SATURN"), 0.5, "SEPARATING"),
    aspect("SEXTILE", point(natal, "MOON"), point(natal, "VENUS"), 0.2),
    aspect("OPPOSITION", point(natal, "MERCURY"), point(natal, "PLUTO"), 6.1),
    aspect("CONJUNCTION", point(natal, "VENUS"), point(natal, "MARS"), 2.5),
    aspect("CONJUNCTION", point(natal, "JUPITER"), point(natal, "CHIRON"), 4.7),
    aspect("TRINE", point(natal, "MOON"), point(natal, "LILITH"), 3),
    aspect("SEXTILE", point(natal, "MARS"), point(natal, "ASC"), 1.9),
    aspect("CONJUNCTION", point(natal, "URANUS"), point(natal, "NEPTUNE"), 5.5, "SEPARATING"),
  ],
};

export const emptyAspectsChart: SingleChart = { ...natal, aspects: [] };

// Another person's chart: Libra rising and a Scorpio Sun, so it is easy to tell apart.
const otherNatal = body({
  ascendant: 190,
  midheaven: 100,
  planets: {
    SUN: 222,
    MOON: 75.5,
    MERCURY: 215,
    VENUS: 180.3,
    MARS: 20,
    JUPITER: 265,
    SATURN: 130,
    URANUS: 240,
    NEPTUNE: 268,
    PLUTO: 205,
    CHIRON: 62,
    NORTH_NODE: 350,
    SOUTH_NODE: 170,
    LILITH: 310,
  },
});

export const otherNatalChart: SingleChart = {
  ...otherNatal,
  aspects: [
    aspect("SQUARE", point(otherNatal, "SUN"), point(otherNatal, "SATURN"), 2),
    aspect("TRINE", point(otherNatal, "VENUS"), point(otherNatal, "MOON"), 4.8),
  ],
};

// The sky at the frozen "now" (2026-01-15 07:00 in New York): Capricorn rising.
const moment = body({
  ascendant: 280,
  midheaven: 205,
  planets: {
    SUN: 295,
    MOON: 250,
    MERCURY: 283,
    VENUS: 291,
    MARS: 297.5,
    JUPITER: 110,
    SATURN: 357,
    URANUS: 58,
    NEPTUNE: 359.5,
    PLUTO: 303,
    CHIRON: 23,
    NORTH_NODE: 340,
    SOUTH_NODE: 160,
    LILITH: 235,
  },
  retrograde: ["JUPITER", "URANUS"],
});

export const momentChart: SingleChart = {
  ...moment,
  aspects: [
    aspect("CONJUNCTION", point(moment, "SUN"), point(moment, "MARS"), 2.5),
    aspect("CONJUNCTION", point(moment, "SATURN"), point(moment, "NEPTUNE"), 2.5),
    aspect("OPPOSITION", point(moment, "MERCURY"), point(moment, "JUPITER"), 7),
    aspect("CONJUNCTION", point(moment, "MERCURY"), point(moment, "ASC"), 3),
  ],
};

// The chart one minute later, for the refresh on the Daily page: the Moon has moved
// into the next degree and the rest is unchanged.
const refreshed = body({
  ascendant: 280.3,
  midheaven: 205.2,
  planets: {
    SUN: 295,
    MOON: 251.6,
    MERCURY: 283,
    VENUS: 291,
    MARS: 297.5,
    JUPITER: 110,
    SATURN: 357,
    URANUS: 58,
    NEPTUNE: 359.5,
    PLUTO: 303,
    CHIRON: 23,
    NORTH_NODE: 340,
    SOUTH_NODE: 160,
    LILITH: 235,
  },
  retrograde: ["JUPITER", "URANUS"],
});

export const refreshedMomentChart: SingleChart = { ...refreshed, aspects: momentChart.aspects };

const cross = (
  type: AspectType,
  point1: AspectPoint,
  point1Owner: "main" | "other",
  point2: AspectPoint,
  orb: number,
): Aspect => ({ ...aspect(type, point1, point2, orb), point1Owner });

// Two-chart fixtures. `main` is the birth chart; `other` is the second profile
// (synastry) or the sky (transit). Each aspect joins a point of one chart to a point
// of the other; point1Owner says which chart point1 belongs to.
export const synastryChart: MultiChart = {
  main: natal,
  other: otherNatal,
  aspects: [
    cross("TRINE", point(natal, "SUN"), "main", point(otherNatal, "MOON"), 1.2),
    cross("SQUARE", point(otherNatal, "VENUS"), "other", point(natal, "MARS"), 2),
    cross("CONJUNCTION", point(natal, "MOON"), "main", point(otherNatal, "SUN"), 0.8),
    cross("SEXTILE", point(natal, "CHIRON"), "main", point(otherNatal, "JUPITER"), 3.1),
    cross("OPPOSITION", point(otherNatal, "LILITH"), "other", point(natal, "SUN"), 4),
    cross("TRINE", point(natal, "ASC"), "main", point(otherNatal, "MERCURY"), 2.2),
  ],
};

export const transitChart: MultiChart = {
  main: natal,
  other: moment,
  aspects: [
    cross("TRINE", point(natal, "SUN"), "main", point(moment, "MOON"), 1.2),
    cross("SQUARE", point(moment, "VENUS"), "other", point(natal, "MARS"), 2),
    cross("CONJUNCTION", point(natal, "SATURN"), "main", point(moment, "SUN"), 0.1),
    cross("SEXTILE", point(natal, "CHIRON"), "main", point(moment, "JUPITER"), 3.1),
    cross("OPPOSITION", point(moment, "LILITH"), "other", point(natal, "SUN"), 4),
    cross("TRINE", point(natal, "ASC"), "main", point(moment, "MERCURY"), 2.2),
  ],
};
