import { createContext, useContext, type ReactNode } from "react";
import { apiFetch } from "../utils/api";
import type { Planet, PlanetName } from "../types/planet";
import type { Cusp, CuspType, KeyAngle } from "../types/cusp";
import type { Aspect } from "../types/aspect";
import type { HouseSystem } from "../types/house-system";
import type { ZodiacSystem } from "../types/zodiac-system";
import type { Ayanamsa } from "../types/ayanamsa";

export interface MultiChart {
  main: {
    planets: Record<PlanetName, Planet>;
    cusps: Record<CuspType, Cusp>;
    keys: Record<KeyType, KeyAngle>;
  };
  other: {
    planets: Record<PlanetName, Planet>;
    cusps: Record<CuspType, Cusp>;
    keys: Record<KeyType, KeyAngle>;
  };
  aspects: Aspect[];
}

export interface SingleChart {
  planets: Record<PlanetName, Planet>;
  cusps: Record<CuspType, Cusp>;
  keys: Record<KeyType, KeyAngle>;
  aspects: Aspect[];
}

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
