import { createContext, useContext, useState, type ReactNode } from "react";
import type { ZodiacSign } from "../types/zodiac";
import { type Aspect } from "../types/aspect";
import { type Planet, type PlanetName } from "../types/planet";
import type { Cusp, CuspType } from "../types/cusp";

type ActiveType = "planet" | "house" | "sign" | "aspect" | "angle";

interface Active {
  type: ActiveType;
  value: PlanetName | ZodiacSign | CuspType | Aspect;
  owner?: "main" | "other";
}

interface Params {
  type: ActiveType;
  value: PlanetName | ZodiacSign | CuspType | Aspect;
  owner?: "main" | "other";
}

interface DesContextType {
  active: Active | null;
  open: (params: Params) => void;
  close: () => void;
  goBack: () => void;
}

const DescContext = createContext<DesContextType | undefined>(undefined);

export const DescProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<Active | null>(null);
  const [_, setHistory] = useState<Active[]>([]);

  const open = ({ type, value, owner }: Params) => {
    if (active) {
      setHistory((prev) => [...prev, active]);
    }

    setActive({
      owner,
      type,
      value,
    });
  };

  const close = () => setActive(null);

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) {
        setActive(null);
        return [];
      }
      const newHistory = [...prev];
      const last = newHistory.pop()!;
      setActive(last);
      return newHistory;
    });
  };

  return (
    <DescContext.Provider
      value={{
        active,
        open,
        close,
        goBack,
      }}
    >
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
