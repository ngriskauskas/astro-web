import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ZodiacSign } from "../types/zodiac";
import { type Aspect, type AspectDisplay } from "../types/aspect";
import { type PlanetName } from "../types/planet";
import type { CuspType, KeyType } from "../types/cusp";
import type { OwnerType } from "./MultiWheelContext";
import type { AngleTiming, AspectTiming, TimingEvent } from "../types/timings";
import type { MoonPhaseDescriptionValue } from "../types/moon";
import { useWheel } from "../hooks/useWheel";

export type ActiveType =
  | "planet"
  | "house"
  | "sign"
  | "aspect"
  | "angle"
  | "keyAngleTiming"
  | "dailyAspectTiming"
  | "aspectTiming"
  | "ingressTiming"
  | "retrogradeTiming"
  | "stationTiming"
  | "moonphase";

export interface Active {
  type: ActiveType;
  value:
    | PlanetName
    | ZodiacSign
    | CuspType
    | AspectDisplay
    | Aspect
    | KeyType
    | AngleTiming
    | AspectTiming
    | TimingEvent
    | MoonPhaseDescriptionValue;
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
  // The items shown before the current one since the drawer was opened.
  const [history, setHistory] = useState<Active[]>([]);
  const { settings } = useWheel();

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

  const close = () => {
    setActive(null);
    setHistory([]);
  };

  const goBack = () => {
    if (history.length === 0) {
      setActive(null);
      return;
    }
    setActive(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  // What the drawer shows belongs to the chart on screen. When the user picks another
  // profile, date or time, the drawer closes rather than describe the previous chart.
  // A chart that refreshes on its own does not change these, so it leaves the drawer open.
  const chartChoice = [
    settings.profileId,
    settings.otherProfileId,
    settings.datetimeOptions?.date,
    settings.datetimeOptions?.time,
  ].join("|");
  const shownFor = useRef(chartChoice);
  useEffect(() => {
    if (shownFor.current === chartChoice) return;
    shownFor.current = chartChoice;
    setActive(null);
    setHistory([]);
  }, [chartChoice]);

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
