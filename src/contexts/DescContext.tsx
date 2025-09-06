import { createContext, useContext, type ReactNode } from "react";
import { apiFetch } from "../utils/api";
import type { AspectType, PlanetName, ZodiacSign } from "./ChartContext";

interface BasicDescriptions {
  aspects: Record<AspectType, string>;
  houses: Record<string, string>;
  planets: Record<PlanetName, string>;
  signs: Record<ZodiacSign, string>;
}

interface DesContextType {
  getBasicDescriptions: () => Promise<BasicDescriptions>;
}

const DescContext = createContext<DesContextType | undefined>(undefined);

export const DescProvider = ({ children }: { children: ReactNode }) => {
  const getBasicDescriptions = async () => {
    return (await apiFetch("/descriptions/basic", {
      method: "GET",
    })) as BasicDescriptions;
  };

  return (
    <DescContext.Provider value={{ getBasicDescriptions }}>
      {children}
    </DescContext.Provider>
  );
};

export const useDesc = () => {
  const context = useContext(DescContext);
  if (!context) {
    throw new Error("useDesc must be used inside DescProvider");
  }
  return context;
};
