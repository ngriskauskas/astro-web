import { createContext, useContext, type ReactNode } from "react";
import { apiFetch } from "../utils/api";
import type { SingleChart, MultiChart } from "../types/chart";

export interface NatalChartOptions {
  birthProfileId: number;
}

export interface CurrentChartOptions {
  datetime: string;
}

export interface SynastryChartOptions {
  mainBirthProfileId: number;
  otherBirthProfileId: number;
}

export interface TransitChartOptions {
  birthProfileId: number;
  datetime: string;
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
