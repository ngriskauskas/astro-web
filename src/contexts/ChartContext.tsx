import { createContext, useContext, type ReactNode } from "react";
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
  | "South Node"
  | "mean Apogee"
  | "osc. Apogee";

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

export interface MultiChart {
  main: {
    planets: Record<string, Planet>;
    cusps: Record<string, Cusp>;
  };
  other: {
    planets: Record<string, Planet>;
    cusps: Record<string, Cusp>;
  };
  aspects: Aspect[];
}

export interface SingleChart {
  planets: Record<string, Planet>;
  cusps: Record<string, Cusp>;
  aspects: Aspect[];
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

interface ChartOptions {
  house_system: HouseSystem;
  zodiac_system: ZodiacSystem;
  ayanamsa?: Ayanamsa;
}

export interface NatalChartOptions extends ChartOptions {
  birth_profile_id: number;
}

export interface CurrentChartOptions extends ChartOptions {
  date: string;
  time: string;
  location: {
    lat: number;
    lon: number;
  };
}

export interface SynastryChartOptions extends ChartOptions {
  main_birth_profile_id: number;
  other_birth_profile_id: number;
}

export interface TransitChartOptions extends ChartOptions {
  birth_profile_id: number;
  date: string;
  time: string;
  location: {
    lat: number;
    lon: number;
  };
}

interface ChartContextType {
  getNatalChart: (options: NatalChartOptions) => Promise<SingleChart>;
  getCurrentChart: (options: CurrentChartOptions) => Promise<SingleChart>;
  getSynastryChart: (options: SynastryChartOptions) => Promise<MultiChart>;
  getTransitChart: (options: TransitChartOptions) => Promise<MultiChart>;
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

  const getCurrentChart = async (options: CurrentChartOptions) => {
    const data = await apiFetch("/charts/generic", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return data as SingleChart;
  };

  const getSynastryChart = async (options: SynastryChartOptions) => {
    const data = await apiFetch("/charts/synastry", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return data as MultiChart;
  };

  const getTransitChart = async (options: TransitChartOptions) => {
    const data = await apiFetch("/charts/transit", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return data as MultiChart;
  };
  return (
    <ChartContext.Provider
      value={{
        getNatalChart,
        getCurrentChart,
        getSynastryChart,
        getTransitChart,
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
