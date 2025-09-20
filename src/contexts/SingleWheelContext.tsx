import { createContext, useEffect, useState, type ReactNode } from "react";
import { type SingleChart, useCharts } from "./ChartContext";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import {
  type CuspAngle,
  type KeyAngleAngle,
} from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { useAuth } from "./AuthContext";
import { type Aspect } from "../types/aspect";
import type { Planet } from "../types/planet";
import { getLocalISODate, getLocalISOTime } from "../utils/funcs";
import type { ZodiacSystem } from "../types/zodiac-system";
import type { Ayanamsa } from "../types/ayanamsa";

export interface SingleWheelContextType {
  settings: ZodiacWheelOptions;
  setSettings: React.Dispatch<React.SetStateAction<ZodiacWheelOptions>>;
  planetAngles: PlanetAngle[];
  cuspAngles: CuspAngle[];
  signAngles: SignAngle[];
  keyAngles: KeyAngleAngle[];
  aspects: Aspect[];
  type: "natal" | "time" | "moment";
}

export const SingleWheelContext = createContext<
  SingleWheelContextType | undefined
>(undefined);

export const SingleWheelProvider = ({
  children,
  type,
  initialDate,
  initialTime,
  initialZodiacSystem,
  initialAyanamsa,
}: {
  children: ReactNode;
  type: "natal" | "time" | "moment";
  initialDate?: string;
  initialTime?: string;
  initialZodiacSystem?: string;
  initialAyanamsa?: string;
}) => {
  const { user } = useAuth();
  const [chart, setChart] = useState<SingleChart | undefined>();
  const { getNatalChart, getCurrentChart } = useCharts();
  const { mainProfile } = useBirthProfiles();
  const [planetAngles, setPlanetAngles] = useState<PlanetAngle[]>([]);
  const [signAngles, setSignAngles] = useState<SignAngle[]>([]);
  const [cuspAngles, setCuspAngles] = useState<CuspAngle[]>([]);
  const [keyAngles, setKeyAngles] = useState<KeyAngleAngle[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);

  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: mainProfile?.id,
    zodiacSystem: (initialZodiacSystem as ZodiacSystem) || "tropical",
    houseSystem: "placidus",
    ayanamsa: (initialAyanamsa as Ayanamsa) || "lahiri",
    aspectOptions: {
      conjunction: { show: true, minOrb: 6 },
      opposition: { show: true, minOrb: 6 },
      square: { show: true, minOrb: 6 },
      trine: { show: true, minOrb: 6 },
      sextile: { show: true, minOrb: 6 },
    },
    objectOptions: {
      showChiron: true,
      showLilith: true,
    },
    displayOptions: {
      angleLabels: true,
      tickMarks: true,
    },
    datetimeOptions:
      type !== "moment"
        ? undefined
        : {
            date: initialDate || getLocalISODate(),
            time: initialTime || getLocalISOTime(),
          },
  });

  const fetchNatalChart = async () => {
    const data = await getNatalChart({
      birth_profile_id: settings.profileId!,
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  const fetchCurrentChart = async () => {
    const data = await getCurrentChart({
      location: { lon: user!.longitude, lat: user!.latitude },
      time: getLocalISOTime(),
      date: getLocalISODate(),
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  const fetchMomentChart = async () => {
    const data = await getCurrentChart({
      location: { lon: user!.longitude, lat: user!.latitude },
      time: settings.datetimeOptions?.time || getLocalISOTime(),
      date: settings.datetimeOptions?.date || getLocalISODate(),
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  useEffect(() => {
    let interval: number;
    if (type === "natal") fetchNatalChart();
    else if (type === "moment") fetchMomentChart();
    else if (type === "time") {
      fetchCurrentChart();
      interval = setInterval(() => {
        fetchCurrentChart();
      }, 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    settings.profileId,
    settings.ayanamsa,
    settings.houseSystem,
    settings.zodiacSystem,
    settings.datetimeOptions,
  ]);

  const round = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const calcCuspAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps[1].position;

    const cusps = Object.entries(chart.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position - ascPos + 360) % 360),
    }));

    return cusps.map((cusp) => {
      const nextId = cusp.name === 12 ? 1 : cusp.name + 1;
      const next = cusps.find((c) => c.name === nextId)!;

      return {
        ...cusp,
        endAngle: next.angle,
      };
    });
  };

  const calcKeyAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps[1].position;

    return Object.entries(chart.keys).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position - ascPos + 360) % 360),
    }));
  };

  const calcInitialPlanetAngles = (
    ascPos: number,
    planets: Record<string, Planet>,
  ) =>
    Object.entries(planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: round((planet.position - ascPos + 360) % 360),
        glyphAngle: round((planet.position - ascPos + 360) % 360),
      }))
      .sort((a, b) => a.angle - b.angle);

  const adjustGlyphAngles = (planets: PlanetAngle[]) => {
    const main: PlanetAngle[] = [];
    planets.forEach((planet, i) => {
      if (i === 0) main.push({ ...planet, glyphAngle: planet.angle });
      else {
        const prev = main[i - 1];
        const diff = ((planet.angle - prev.glyphAngle + 540) % 360) - 180;
        const glyphAngle = round(
          Math.abs(diff) <= 4.5 ? (prev.glyphAngle + 5.5) % 360 : planet.angle,
        );
        main.push({ ...planet, glyphAngle });
      }
    });
    planets.forEach((planet, i) => {
      const prev = i === 0 ? main[main.length - 1] : main[i - 1];
      const diff = ((planet.angle - prev.glyphAngle + 540) % 360) - 180;
      const glyphAngle = round(
        Math.abs(diff) <= 4.5 ? (prev.glyphAngle + 5.5) % 360 : planet.angle,
      );
      main[i] = { ...planet, glyphAngle };
    });

    return main;
  };

  const calcPlanetAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps[1].position;

    const rawPlanetAngles = calcInitialPlanetAngles(ascPos, chart.planets);

    return adjustGlyphAngles(rawPlanetAngles);
  };

  const calcSignAngles = (chart: SingleChart) => {
    const ascSign = chart.cusps[1].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.cusps[1].deg_in_sign;
    return ZodiacSigns.map((s, i) => {
      const offset = (i - ascIndex + 12) % 12;
      const angle = round((startAngleFirstSign + offset * 30 + 360) % 360);
      const sign = s as ZodiacSign;
      return { sign, angle };
    });
  };

  useEffect(() => {
    if (!chart) return;
    setPlanetAngles(calcPlanetAngles(chart));
    setCuspAngles(calcCuspAngles(chart));
    setSignAngles(calcSignAngles(chart));
    setKeyAngles(calcKeyAngles(chart));
    setAspects(chart.aspects);
  }, [chart]);

  return (
    <SingleWheelContext.Provider
      value={{
        settings,
        setSettings,
        planetAngles,
        signAngles,
        cuspAngles,
        keyAngles,
        aspects,
        type,
      }}
    >
      {children}
    </SingleWheelContext.Provider>
  );
};
