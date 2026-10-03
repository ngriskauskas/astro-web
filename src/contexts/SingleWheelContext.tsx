import { createContext, useEffect, useState, type ReactNode } from "react";
import { useCharts } from "./ChartContext";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import { type CuspAngle, type KeyAngleAngle } from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import type { Aspect } from "../types/aspect";
import type { Planet } from "../types/planet";
import {
  getLocalISODate,
  getLocalISODateTime,
  getLocalISOTime,
  isDateAndTime,
} from "../utils/funcs";
import { useSearchParams } from "react-router-dom";
import type { SingleChart } from "../types/chart";
import { useChartSettings } from "./ChartSettingsContext";

// "loading" until the first chart arrives; "error" when the chart asked for could not
// be loaded. A chart already on screen stays there while a newer one is loading.
export type WheelStatus = "loading" | "ready" | "error";

export interface SingleWheelContextType {
  settings: ZodiacWheelOptions;
  setSettings: React.Dispatch<React.SetStateAction<ZodiacWheelOptions>>;
  planetAngles: PlanetAngle[];
  cuspAngles: CuspAngle[];
  signAngles: SignAngle[];
  keyAngles: KeyAngleAngle[];
  aspects: Aspect[];
  chartAspects: Aspect[];
  status: WheelStatus;
  type: "natal" | "time" | "moment";
}

export const SingleWheelContext = createContext<SingleWheelContextType | undefined>(undefined);

export const SingleWheelProvider = ({
  children,
  type,
}: {
  children: ReactNode;
  type: "natal" | "time" | "moment";
}) => {
  const [searchParams] = useSearchParams();
  const [chart, setChart] = useState<SingleChart | undefined>();
  const [status, setStatus] = useState<WheelStatus>("loading");
  const { getNatalChart, getCurrentChart } = useCharts();
  const { mainProfile } = useBirthProfiles();
  const {
    settings: { aspectOptions },
  } = useChartSettings();
  const [planetAngles, setPlanetAngles] = useState<PlanetAngle[]>([]);
  const [signAngles, setSignAngles] = useState<SignAngle[]>([]);
  const [cuspAngles, setCuspAngles] = useState<CuspAngle[]>([]);
  const [keyAngles, setKeyAngles] = useState<KeyAngleAngle[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [chartAspects, setChartAspects] = useState<Aspect[]>([]);

  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: mainProfile?.id,
  });

  useEffect(() => {
    if (type !== "moment") return;

    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time") || "23:59:00";

    setSettings((prev) => ({
      ...prev,
      datetimeOptions: {
        date: dateParam || prev.datetimeOptions?.date || getLocalISODate(),
        time: (dateParam && timeParam) || prev.datetimeOptions?.time || getLocalISOTime(),
      },
    }));
  }, [searchParams]);

  useEffect(() => {
    // Set when the settings change or the page is left, so that a response to an
    // earlier request never replaces the chart for a later one.
    let cancelled = false;
    let loaded = false;

    const load = async (request: () => Promise<SingleChart>, isRefresh = false) => {
      if (!isRefresh) setStatus("loading");
      try {
        const data = await request();
        if (cancelled) return;
        loaded = true;
        setChart(data);
        setStatus("ready");
      } catch {
        // A failed refresh keeps the chart that is already on screen.
        if (cancelled || (isRefresh && loaded)) return;
        setStatus("error");
      }
    };

    let interval: number | undefined;
    if (type === "natal") {
      const birthProfileId = settings.profileId;
      if (birthProfileId !== undefined) load(() => getNatalChart({ birthProfileId }));
    } else if (type === "moment") {
      const { date, time } = settings.datetimeOptions ?? {};
      if (isDateAndTime(date, time)) load(() => getCurrentChart({ datetime: `${date}T${time}` }));
    } else {
      const current = () => getCurrentChart({ datetime: getLocalISODateTime() });
      load(current);
      interval = window.setInterval(() => load(current, true), 60 * 1000);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [aspectOptions, settings.profileId, settings.datetimeOptions]);

  const round = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const calcCuspAngles = (chart: SingleChart) => {
    const ascPos = chart.houses[1].position.position;

    const cusps = Object.entries(chart.houses).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
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
    const ascPos = chart.houses[1].position.position;

    return Object.entries(chart.keyAngles).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
    }));
  };

  const calcInitialPlanetAngles = (ascPos: number, planets: Record<string, Planet>) =>
    Object.entries(planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: round((planet.position.position - ascPos + 360) % 360),
        glyphAngle: round((planet.position.position - ascPos + 360) % 360),
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
    const ascPos = chart.houses[1].position.position;

    const rawPlanetAngles = calcInitialPlanetAngles(ascPos, chart.planets);

    return adjustGlyphAngles(rawPlanetAngles);
  };

  const calcSignAngles = (chart: SingleChart) => {
    const ascSign = chart.houses[1].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.houses[1].position.degInSign;
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
    setChartAspects(chart.aspects);
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
        chartAspects,
        status,
        type,
      }}
    >
      {children}
    </SingleWheelContext.Provider>
  );
};
