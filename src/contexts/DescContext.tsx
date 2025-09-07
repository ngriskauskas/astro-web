import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../utils/api";
import type { AspectType, PlanetName, ZodiacSign } from "./ChartContext";

interface BasicDescriptions {
  aspects: Record<AspectType, string>;
  houses: Record<string, string>;
  planets: Record<string, string>;
  signs: Record<ZodiacSign, string>;
}

type DescriptionType = "planet" | "house" | "sign" | "aspect";

interface Description {
  type: DescriptionType;
  desc: string;
  id: string;
}

interface DescriptionParams {
  type: DescriptionType;
  id: string;
}

interface DesContextType {
  active: Description | null;
  open: (params: DescriptionParams) => void;
  close: () => void;
}

const DescContext = createContext<DesContextType | undefined>(undefined);

export const DescProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<Description | null>(null);
  const [basicDescriptions, setBasicDescriptions] =
    useState<BasicDescriptions | null>(null);

  const open = ({ type, id }: DescriptionParams) => {
    if (!basicDescriptions) return;
    let desc = "";
    switch (type) {
      case "planet":
        desc = basicDescriptions.planets[id] ?? "No description";
        break;
      case "house":
        desc = basicDescriptions.houses[id] ?? "No description";
        break;
      case "sign":
        desc = basicDescriptions.signs[id as ZodiacSign] ?? "No description";
        break;
      case "aspect":
        desc = basicDescriptions.aspects[id as AspectType] ?? "No description";
        break;
    }

    setActive({ type, desc, id });
  };

  const close = () => setActive(null);

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
    <DescContext.Provider value={{ active, open, close }}>
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
