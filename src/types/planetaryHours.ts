import type { PlanetName } from "./planet";

export type ClassicalPlanet = Extract<
  PlanetName,
  "SUN" | "MOON" | "MARS" | "MERCURY" | "JUPITER" | "VENUS" | "SATURN"
>;

export interface PlanetaryHour {
  hour: number;
  ruler: ClassicalPlanet;
  dayRuler: ClassicalPlanet;
  period: "DAY" | "NIGHT";
  dateTime: string;
}

export interface PlanetaryHourDescriptionValue {
  hour: PlanetaryHour;
  end: Date;
}

export interface PlanetaryHoursType {
  date: string;
  dayRuler: ClassicalPlanet;
  sunrise: string;
  sunset: string;
  dayEnd: string;
  hours: PlanetaryHour[];
}
