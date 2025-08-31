import {
  createContext,
  useEffect,
  useState,
  useContext,
  type ReactNode,
} from "react";
import { apiFetch } from "../utils/api";

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
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"
  | "Chiron"
  | "true Node"
  | "mean Apogee";

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

export interface SingleChart {
  planets: Record<string, Planet>;
  cusps: Record<string, Cusp>;
  aspects: Aspect[];
}

export type HouseSystem =
  | "whole_sign"
  | "placidus"
  | "koch"
  | "equal"
  | "campanus"
  | "regio";

export type ZodiacSystem = "tropical" | "sidereal";

export type Ayanamsa =
  | "faganBradely"
  | "lahiri"
  | "deLuce"
  | "raman"
  | "ushaSashi"
  | "krishnamurit"
  | "djwhwalKhul"
  | "yukteshwar";

interface ChartOptions {
  house_system: HouseSystem;
  zodiac_system: ZodiacSystem;
  ayanamsa?: Ayanamsa;
}

export interface NatalChartOptions extends ChartOptions {
  birth_profile_id: number;
}

interface ChartContextType {
  getNatalChart: (options: NatalChartOptions) => Promise<SingleChart>;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const ChartProvider = ({ children }: { children: ReactNode }) => {
  const getNatalChart = async (options: NatalChartOptions) => {
    const data = await apiFetch("/charts/natal", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return data as SingleChart;
  };

  return (
    <ChartContext.Provider
      value={{
        getNatalChart,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export const useCharts = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useCharts must be used inside ChartProvider,");
  }
  return context;
};
