import { createContext, useContext, useState, type ReactNode } from "react";
import type { ZodiacSign } from "../types/zodiac";
import { type Aspect, type AspectDisplay } from "../types/aspect";
import { type PlanetName } from "../types/planet";
import type { CuspType } from "../types/cusp";
import type { OwnerType } from "./MultiWheelContext";
import type { MoonPhaseTiming } from "../hooks/timings/useMoonTimings";

type ActiveType =
  | "planet"
  | "house"
  | "sign"
  | "aspect"
  | "angle"
  | "moonphase";

interface Active {
  type: ActiveType;
  value: PlanetName | ZodiacSign | CuspType | AspectDisplay | MoonPhaseTiming;
  owner?: OwnerType;
}

interface DesContextType {
  active: Active | null;
  open: (params: Active) => void;
  close: () => void;
  goBack: () => void;
}

const DescContext = createContext<DesContextType | undefined>(undefined);

export const DescProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<Active | null>(null);
  const [_, setHistory] = useState<Active[]>([]);

  const open = ({ type, value, owner }: Active) => {
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
