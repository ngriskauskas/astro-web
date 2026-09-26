import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../utils/api";
import type {
  AstrologySettings,
  AspectOptions,
  DisplayOptions,
  ObjectOptions,
} from "../types/astrologySettings";
import type { Ayanamsa } from "../types/ayanamsa";
import type { HouseSystem } from "../types/house-system";
import type { ZodiacSystem } from "../types/zodiac-system";

interface ChartSettingsContextType {
  settings: AstrologySettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<AstrologySettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: AstrologySettings = {
  zodiacType: "TROPICAL" as ZodiacSystem,
  houseSystem: "PLACIDUS" as HouseSystem,
  ayanamsa: "LAHIRI" as Ayanamsa,
  aspectOptions: {
    CONJUNCTION: { show: true, minOrb: 8 },
    OPPOSITION: { show: true, minOrb: 8 },
    TRINE: { show: true, minOrb: 8 },
    SQUARE: { show: true, minOrb: 8 },
    SEXTILE: { show: true, minOrb: 6 },
  } as AspectOptions,
  objectOptions: {
    showChiron: true,
    showLilith: false,
  } as ObjectOptions,
  displayOptions: {
    tickMarks: true,
    angleLabels: true,
  } as DisplayOptions,
};

const ChartSettingsContext = createContext<ChartSettingsContextType | undefined>(undefined);

export const ChartSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AstrologySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/settings", {
        method: "GET",
      });
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          aspectOptions: { ...prev.aspectOptions, ...data.aspectOptions },
          objectOptions: { ...prev.objectOptions, ...data.objectOptions },
          displayOptions: { ...prev.displayOptions, ...data.displayOptions },
        }));
      }
    } catch (err) {
      console.error("Failed to load chart settings", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AstrologySettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      aspectOptions: newSettings.aspectOptions
        ? { ...settings.aspectOptions, ...newSettings.aspectOptions }
        : settings.aspectOptions,
      objectOptions: newSettings.objectOptions
        ? { ...settings.objectOptions, ...newSettings.objectOptions }
        : settings.objectOptions,
      displayOptions: newSettings.displayOptions
        ? { ...settings.displayOptions, ...newSettings.displayOptions }
        : settings.displayOptions,
    };

    const data = await apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(updated),
    });

    setSettings(data);
  };

  const resetSettings = async () => {
    const data = await apiFetch("/settings/reset", {
      method: "POST",
    });
    setSettings(data || DEFAULT_SETTINGS);
  };

  return (
    <ChartSettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </ChartSettingsContext.Provider>
  );
};

export const useChartSettings = () => {
  const context = useContext(ChartSettingsContext);
  if (!context) {
    throw new Error("useChartSettings must be used inside ChartSettingsProvider");
  }
  return context;
};
