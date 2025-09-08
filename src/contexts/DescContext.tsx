import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../utils/api";
import type {
  Aspect,
  AspectType,
  PlanetName,
  ZodiacSign,
} from "../types/zodiac";

interface BasicDescriptions {
  aspects: Record<AspectType, string>;
  houses: Record<string, string>;
  planets: Record<string, string>;
  signs: Record<ZodiacSign, string>;
}

type DescriptionType = "planet" | "house" | "sign" | "aspect" | "angle";

interface Description {
  type: DescriptionType;
  desc: string;
  value: PlanetName | ZodiacSign | string | Aspect;
}

interface DescriptionParams {
  type: DescriptionType;
  value: PlanetName | ZodiacSign | string | Aspect;
}

interface DesContextType {
  active: Description | null;
  open: (params: DescriptionParams) => void;
  close: () => void;
  goBack: () => void;
}

const DescContext = createContext<DesContextType | undefined>(undefined);

export const DescProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<Description | null>(null);
  const [_, setHistory] = useState<Description[]>([]);
  const [basicDescriptions, setBasicDescriptions] =
    useState<BasicDescriptions | null>(null);

  const open = ({ type, value }: DescriptionParams) => {
    if (!basicDescriptions) return;
    const desc: Description = (() => {
      switch (type) {
        case "planet":
          return {
            type,
            value,
            desc: basicDescriptions.planets[value as PlanetName],
          };
        case "house":
          const houseVal =
            typeof value === "string"
              ? (value as string).replace("cusp", "")
              : value;
          return {
            type,
            value: houseVal,
            desc: basicDescriptions.houses[houseVal],
          };
        case "sign":
          return {
            type,
            value,
            desc: basicDescriptions.signs[value as ZodiacSign],
          };
        case "aspect":
          return {
            type,
            value,
            desc: basicDescriptions.aspects[(value as Aspect).type],
          };
        case "angle":
          return {
            type,
            value,
            desc: basicDescriptions.houses[value],
          };
      }
    })();

    if (active) {
      setHistory((prev) => [...prev, active]);
    }

    setActive(desc);
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

  useEffect(() => {
    const fetchDescriptions = async () => {
      const data = (await apiFetch("/descriptions/basic", {
        method: "GET",
      })) as BasicDescriptions;
      setBasicDescriptions(data);
    };
    fetchDescriptions();
  }, []);

  return (
    <DescContext.Provider value={{ active, open, close, goBack }}>
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
