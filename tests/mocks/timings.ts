import type { Aspect, AspectPoint, AspectType } from "../../src/types/aspect";
import type { KeyAngle, KeyType } from "../../src/types/cusp";
import type { MoonPhaseTiming, MoonTimingsType } from "../../src/types/moon";
import type { Planet, PlanetName } from "../../src/types/planet";
import type {
  AngleTiming,
  AspectTiming,
  CurrentTimingsType,
  DailyTimingsType,
} from "../../src/types/timings";
import { momentChart, position, signOf } from "./charts";

// Timing fixtures for the frozen clock: Thursday 15 January 2026, 07:00 in New York,
// in the week of Sunday 11 to Saturday 17 January. Times have no zone suffix, so they
// are read in the test time zone, as the app reads them.

const planet = (name: PlanetName, overrides: Partial<Planet> = {}): AspectPoint => ({
  type: "Planet",
  value: { ...momentChart.planets[name], ...overrides },
});

const angle = (name: KeyType, longitude: number): KeyAngle => ({
  name,
  position: position(longitude),
  sign: signOf(longitude),
});

const anglePoint = (name: KeyType, longitude: number): AspectPoint => ({
  type: "Angle",
  value: angle(name, longitude),
});

const aspect = (type: AspectType, point1: AspectPoint, point2: AspectPoint, orb = 0): Aspect => ({
  type,
  orb,
  motion: "APPLYING",
  point1,
  point2,
});

const aspectTiming = (value: Aspect, start: string, exact: string[], end: string): AspectTiming => ({
  aspect: value,
  startAspect: { aspect: { ...value, orb: 3 }, dateTime: start },
  exactDateRanges: exact.map((dateTime) => ({ aspect: { ...value, orb: 0 }, dateTime })),
  endAspect: { aspect: { ...value, orb: 3, motion: "SEPARATING" }, dateTime: end },
});

// The Ascendant enters a new sign roughly every two hours.
const ascendantChanges: [string, number][] = [
  ["2026-01-15T00:30:00", 210],
  ["2026-01-15T03:00:00", 240],
  ["2026-01-15T05:40:00", 270],
  ["2026-01-15T07:30:00", 300],
  ["2026-01-15T08:50:00", 330],
  ["2026-01-15T09:55:00", 0],
  ["2026-01-15T11:10:00", 30],
  ["2026-01-15T13:00:00", 60],
  ["2026-01-15T15:20:00", 90],
  ["2026-01-15T17:50:00", 120],
  ["2026-01-15T20:20:00", 150],
  ["2026-01-15T22:50:00", 180],
];

const angleTimings: AngleTiming[] = ascendantChanges.map(([dateTime, longitude]) => ({
  angle: angle("ASC", longitude),
  dateTime,
}));

export const sunConjunctsAscendant = aspectTiming(
  aspect("CONJUNCTION", planet("SUN"), anglePoint("ASC", 295)),
  "2026-01-15T06:55:00",
  ["2026-01-15T07:15:00"],
  "2026-01-15T07:35:00",
);

export const venusConjunctsAscendant = aspectTiming(
  aspect("CONJUNCTION", anglePoint("ASC", 291), planet("VENUS")),
  "2026-01-15T09:20:00",
  ["2026-01-15T09:42:00"],
  "2026-01-15T10:05:00",
);

export const dailyTimings: DailyTimingsType = {
  angleTimings,
  aspects: [
    sunConjunctsAscendant,
    venusConjunctsAscendant,
    // Neither of these is a conjunction with the Ascendant; the timeline leaves them out.
    aspectTiming(
      aspect("SQUARE", planet("MARS"), anglePoint("ASC", 27.5)),
      "2026-01-15T10:40:00",
      ["2026-01-15T11:00:00"],
      "2026-01-15T11:20:00",
    ),
    aspectTiming(
      aspect("CONJUNCTION", planet("MOON"), planet("PLUTO")),
      "2026-01-15T12:00:00",
      ["2026-01-15T14:00:00"],
      "2026-01-15T16:00:00",
    ),
  ],
};

export const emptyDailyTimings: DailyTimingsType = { angleTimings, aspects: [] };

// Mon: Mercury-Jupiter starts. Tue and Wed: exact. Wed: Mercury turns retrograde.
// Thu: Sun-Mars exact and Mars enters Aquarius in the same minute. Fri: Mercury-Jupiter
// ends, Saturn stations direct. Sunday and Saturday have no events.
export const mercuryTrineJupiter = aspectTiming(
  aspect("TRINE", planet("MERCURY"), planet("JUPITER")),
  "2026-01-12T10:00:00",
  ["2026-01-13T15:15:00", "2026-01-14T08:30:00"],
  "2026-01-16T18:00:00",
);

export const sunSquareMars = aspectTiming(
  aspect("SQUARE", planet("SUN"), planet("MARS")),
  "2026-01-10T09:00:00",
  ["2026-01-15T15:15:00"],
  "2026-01-20T09:00:00",
);

export const weeklyTimings: CurrentTimingsType = {
  aspects: [
    mercuryTrineJupiter,
    sunSquareMars,
    // Involves the Descendant; Weekly Timings leaves it out.
    aspectTiming(
      aspect("OPPOSITION", planet("VENUS"), anglePoint("DC", 111)),
      "2026-01-12T11:00:00",
      ["2026-01-12T12:00:00"],
      "2026-01-12T13:00:00",
    ),
  ],
  ingresses: [
    {
      planet: momentChart.planets.MARS,
      startPlanet: { planet: momentChart.planets.MARS, dateTime: "2025-12-08T04:00:00" },
      endPlanet: {
        planet: { ...momentChart.planets.MARS, position: position(300), sign: "AQUARIUS" },
        dateTime: "2026-01-15T15:15:00",
      },
    },
  ],
  retrogrades: [
    {
      planet: momentChart.planets.MERCURY,
      startPlanet: {
        planet: { ...momentChart.planets.MERCURY, retrograde: true },
        dateTime: "2026-01-14T06:00:00",
      },
      endPlanet: { planet: momentChart.planets.MERCURY, dateTime: "2026-02-04T19:00:00" },
    },
  ],
  stations: [
    {
      planet: momentChart.planets.SATURN,
      startPlanet: { planet: momentChart.planets.SATURN, dateTime: "2026-01-14T12:00:00" },
      exactStationPlanet: {
        planet: { ...momentChart.planets.SATURN, stationary: true },
        dateTime: "2026-01-16T12:00:00",
      },
      endPlanet: { planet: momentChart.planets.SATURN, dateTime: "2026-01-18T12:00:00" },
    },
  ],
};

export const emptyWeeklyTimings: CurrentTimingsType = {
  aspects: [],
  ingresses: [],
  retrogrades: [],
  stations: [],
};

const moonPhase = (phase: string, dateTime: string, longitude: number): MoonPhaseTiming => ({
  phase,
  waxing: phase.startsWith("WAXING") || phase === "FIRST_QUARTER",
  planet: { ...momentChart.planets.MOON, position: position(longitude), sign: signOf(longitude) },
  dateTime,
});

const waningCrescent = moonPhase("WANING_CRESCENT", "2026-01-13T22:10:00", 250);

export const moonTimings: MoonTimingsType = {
  currentPhase: waningCrescent,
  phaseLoop: [
    waningCrescent,
    moonPhase("NEW_MOON", "2026-01-18T14:52:00", 298),
    moonPhase("WAXING_CRESCENT", "2026-01-22T03:20:00", 345),
    moonPhase("FIRST_QUARTER", "2026-01-25T23:47:00", 36),
    moonPhase("WAXING_GIBBOUS", "2026-01-29T09:05:00", 80),
    moonPhase("FULL_MOON", "2026-02-01T17:09:00", 133),
    // A time the app cannot read: the phase is shown as "Timing unavailable".
    moonPhase("WANING_GIBBOUS", "not-a-date", 180),
    moonPhase("LAST_QUARTER", "2026-02-09T07:43:00", 231),
  ],
};
