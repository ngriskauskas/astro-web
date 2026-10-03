import { createContext, useEffect, useState, type ReactNode } from "react";
import { useCharts } from "./ChartContext";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import { type CuspAngle, type KeyAngleAngle } from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import type { Aspect } from "../types/aspect";
import type { Planet } from "../types/planet";
import { getLocalISODate, getLocalISOTime, isDateAndTime } from "../utils/funcs";
import { useSearchParams } from "react-router-dom";
import type { MultiChart } from "../types/chart";
import { useChartSettings } from "./ChartSettingsContext";
import type { WheelStatus } from "./SingleWheelContext";

export type OwnerType = "main" | "other";

export interface MultiWheelContextType {
  settings: ZodiacWheelOptions;
  setSettings: React.Dispatch<React.SetStateAction<ZodiacWheelOptions>>;
  mainPlanetAngles: PlanetAngle[];
  otherPlanetAngles: PlanetAngle[];
  mainCuspAngles: CuspAngle[];
  otherCuspAngles: CuspAngle[];
  mainKeyAngles: KeyAngleAngle[];
  otherKeyAngles: KeyAngleAngle[];
  signAngles: SignAngle[];
  aspects: Aspect[];
  chartAspects: Aspect[];
  status: WheelStatus;
  type: "synastry" | "transit";
}

export const MultiWheelContext = createContext<MultiWheelContextType | undefined>(undefined);

export const MultiWheelProvider = ({
  children,
  type,
}: {
  children: ReactNode;
  type: "synastry" | "transit";
}) => {
  const [searchParams] = useSearchParams();
  const [chart, setChart] = useState<MultiChart | undefined>();
  const [status, setStatus] = useState<WheelStatus>("loading");
  const { getSynastryChart, getTransitChart } = useCharts();
  const { mainProfile, profiles } = useBirthProfiles();
  const {
    settings: { aspectOptions },
  } = useChartSettings();
  const [mainPlanetAngles, setMainPlanetAngles] = useState<PlanetAngle[]>([]);
  const [otherPlanetAngles, setOtherPlanetAngles] = useState<PlanetAngle[]>([]);
  const [signAngles, setSignAngles] = useState<SignAngle[]>([]);
  const [mainCuspAngles, setMainCuspAngles] = useState<CuspAngle[]>([]);
  const [otherCuspAngles, setOtherCuspAngles] = useState<CuspAngle[]>([]);
  const [mainKeyAngles, setMainKeyAngles] = useState<KeyAngleAngle[]>([]);
  const [otherKeyAngles, setOtherKeyAngles] = useState<KeyAngleAngle[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);

  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: mainProfile?.id,
    otherProfileId: type === "synastry" ? profiles.find((x) => !x.isMain)?.id : undefined,
    datetimeOptions:
      type === "synastry"
        ? undefined
        : {
            date: getLocalISODate(),
            time: getLocalISOTime(),
          },
  });

  useEffect(() => {
    if (type !== "transit") return;
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

    const load = async (request: () => Promise<MultiChart>) => {
      setStatus("loading");
      try {
        const data = await request();
        if (cancelled) return;
        setChart(data);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    const { profileId, otherProfileId, datetimeOptions } = settings;
    if (profileId !== undefined) {
      if (type === "synastry") {
        if (otherProfileId !== undefined) {
          load(() =>
            getSynastryChart({
              mainBirthProfileId: profileId,
              otherBirthProfileId: otherProfileId,
            }),
          );
        }
      } else if (isDateAndTime(datetimeOptions?.date, datetimeOptions?.time)) {
        load(() =>
          getTransitChart({
            birthProfileId: profileId,
            datetime: `${datetimeOptions!.date}T${datetimeOptions!.time}`,
          }),
        );
      }
    }

    return () => {
      cancelled = true;
    };
  }, [aspectOptions, settings.profileId, settings.otherProfileId, settings.datetimeOptions]);

  const round = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const getOrientationAscendant = (chart: MultiChart) =>
    type === "transit" ? chart.other.houses[1] : chart.main.houses[1];

  const calcCuspAngles = (chart: MultiChart) => {
    const ascPos = getOrientationAscendant(chart).position.position;

    const mainCusps = Object.entries(chart.main.houses).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
    }));
    const otherCusps = Object.entries(chart.other.houses).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
    }));

    const main = mainCusps.map((cusp) => {
      const nextid = cusp.name === 12 ? 1 : cusp.name + 1;
      const next = mainCusps.find((c) => c.name === nextid)!;

      return {
        ...cusp,
        endAngle: next.angle,
      };
    });
    const other = otherCusps.map((cusp) => {
      const nextid = cusp.name === 12 ? 1 : cusp.name + 1;
      const next = otherCusps.find((c) => c.name === nextid)!;

      return {
        ...cusp,
        endAngle: next.angle,
      };
    });

    return { main, other };
  };

  const calcKeyAngles = (chart: MultiChart) => {
    const ascPos = getOrientationAscendant(chart).position.position;

    const main = Object.entries(chart.main.keyAngles).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
    }));
    const other = Object.entries(chart.other.keyAngles).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position.position - ascPos + 360) % 360),
    }));

    return { main, other };
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

  const calcPlanetAngles = (chart: MultiChart) => {
    const ascPos = getOrientationAscendant(chart).position.position;

    const rawMainPlanetAngles = calcInitialPlanetAngles(ascPos, chart.main.planets);

    const rawOtherPlanetAngles = calcInitialPlanetAngles(ascPos, chart.other.planets);

    const main = adjustGlyphAngles(rawMainPlanetAngles);
    const other = adjustGlyphAngles(rawOtherPlanetAngles);

    return { main, other };
  };

  const calcSignAngles = (chart: MultiChart) => {
    const ascendant = getOrientationAscendant(chart);
    const ascSign = ascendant.sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -ascendant.position.degInSign;
    return ZodiacSigns.map((s, i) => {
      const offset = (i - ascIndex + 12) % 12;
      const angle = round((startAngleFirstSign + offset * 30 + 360) % 360);
      const sign = s as ZodiacSign;
      return { sign, angle };
    });
  };

  useEffect(() => {
    if (!chart) return;
    const { main: mainPAngles, other: otherPAngles } = calcPlanetAngles(chart);
    setMainPlanetAngles(mainPAngles);
    setOtherPlanetAngles(otherPAngles);

    const { main: mainCAngles, other: otherCAngles } = calcCuspAngles(chart);
    setMainCuspAngles(mainCAngles);
    setOtherCuspAngles(otherCAngles);

    const { main: mainKAngles, other: otherKAngles } = calcKeyAngles(chart);
    setMainKeyAngles(mainKAngles);
    setOtherKeyAngles(otherKAngles);

    setSignAngles(calcSignAngles(chart));
    setAspects(chart.aspects);
  }, [chart]);

  return (
    <MultiWheelContext.Provider
      value={{
        settings,
        setSettings,
        mainPlanetAngles,
        otherPlanetAngles,
        mainCuspAngles,
        otherCuspAngles,
        mainKeyAngles,
        otherKeyAngles,
        signAngles,
        aspects,
        chartAspects: chart?.aspects ?? [],
        status,
        type,
      }}
    >
      {children}
    </MultiWheelContext.Provider>
  );
};
