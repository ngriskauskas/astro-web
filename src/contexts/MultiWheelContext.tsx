import { createContext, useEffect, useState, type ReactNode } from "react";
import { type MultiChart, useCharts } from "./ChartContext";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import {
  type CuspAngle,
  type KeyAngleAngle,
} from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { useAuth } from "./AuthContext";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import { type Aspect } from "../types/aspect";
import type { Planet } from "../types/planet";
import { getLocalISODate, getLocalISOTime } from "../utils/funcs";
import type { ZodiacSystem } from "../types/zodiac-system";
import type { Ayanamsa } from "../types/ayanamsa";
import { useSearchParams } from "react-router-dom";

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
  type: "synastry" | "transit";
}

export const MultiWheelContext = createContext<
  MultiWheelContextType | undefined
>(undefined);

export const MultiWheelProvider = ({
  children,
  type,
}: {
  children: ReactNode;
  type: "synastry" | "transit";
}) => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [chart, setChart] = useState<MultiChart | undefined>();
  const { getSynastryChart, getTransitChart } = useCharts();
  const { mainProfile, profiles } = useBirthProfiles();
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
    otherProfileId: type === "synastry" ? profiles[0].id : undefined,
    zodiacSystem: "tropical",
    houseSystem: "placidus",
    ayanamsa: "lahiri",
    aspectOptions: {
      conjunction: { show: true, minOrb: 3 },
      opposition: { show: true, minOrb: 3 },
      square: { show: true, minOrb: 3 },
      trine: { show: true, minOrb: 3 },
      sextile: { show: true, minOrb: 3 },
    },
    objectOptions: {
      showChiron: true,
      showLilith: true,
    },
    displayOptions: {
      angleLabels: false,
      tickMarks: true,
    },
    datetimeOptions:
      type === "synastry"
        ? undefined
        : {
            date: getLocalISODate(),
            time: getLocalISOTime(),
          },
  });

  const fetchSynastryChart = async () => {
    const data = await getSynastryChart({
      main_birth_profile_id: settings.profileId!,
      other_birth_profile_id: settings.otherProfileId!,
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  const fetchCurrentChart = async () => {
    const data = await getTransitChart({
      birth_profile_id: settings.profileId!,
      location: { lon: user!.longitude, lat: user!.latitude },
      time: settings.datetimeOptions!.time,
      date: settings.datetimeOptions!.date,
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  useEffect(() => {
    if (type !== "transit") return;
    const dateParam = searchParams.get("date");
    const timeParam = "23:59:00";
    const zodiacParam = searchParams.get("zodiac_system");
    const ayanamsaParam = searchParams.get("ayanamsa");

    setSettings((prev) => ({
      ...prev,
      datetimeOptions: {
        date: dateParam || prev.datetimeOptions?.date || getLocalISODate(),
        time:
          (dateParam && timeParam) ||
          prev.datetimeOptions?.time ||
          getLocalISOTime(),
      },
      zodiacSystem: (zodiacParam as ZodiacSystem) || prev.zodiacSystem,
      ayanamsa: (ayanamsaParam as Ayanamsa) || prev.ayanamsa,
    }));
  }, [searchParams]);

  useEffect(() => {
    if (type === "synastry") fetchSynastryChart();
    else if (type === "transit") fetchCurrentChart();
  }, [
    settings.profileId,
    settings.otherProfileId,
    settings.ayanamsa,
    settings.houseSystem,
    settings.zodiacSystem,
    settings.datetimeOptions,
  ]);

  const round = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const calcCuspAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps[1].position;

    const mainCusps = Object.entries(chart.main.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position - ascPos + 360) % 360),
    }));
    const otherCusps = Object.entries(chart.other.cusps).map(
      ([_key, cusp]) => ({
        ...cusp,
        angle: round((cusp.position - ascPos + 360) % 360),
      }),
    );

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
    const ascPos = chart.main.cusps[1].position;

    const main = Object.entries(chart.main.keys).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position - ascPos + 360) % 360),
    }));
    const other = Object.entries(chart.other.keys).map(([_key, cusp]) => ({
      ...cusp,
      angle: round((cusp.position - ascPos + 360) % 360),
    }));

    return { main, other };
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

  const calcPlanetAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps[1].position;

    const rawMainPlanetAngles = calcInitialPlanetAngles(
      ascPos,
      chart.main.planets,
    );

    const rawOtherPlanetAngles = calcInitialPlanetAngles(
      ascPos,
      chart.other.planets,
    );

    const main = adjustGlyphAngles(rawMainPlanetAngles);
    const other = adjustGlyphAngles(rawOtherPlanetAngles);

    return { main, other };
  };

  const calcSignAngles = (chart: MultiChart) => {
    const ascSign = chart.main.cusps[1].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.main.cusps[1].deg_in_sign;
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
        type,
      }}
    >
      {children}
    </MultiWheelContext.Provider>
  );
};
