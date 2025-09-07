import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  type MultiChart,
  useCharts,
  ZodiacSigns,
  type ZodiacSign,
  type Aspect,
} from "./ChartContext";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import { type CuspAngle } from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { useAuth } from "./AuthContext";

export interface MultiWheelContextType {
  settings: ZodiacWheelOptions;
  setSettings: React.Dispatch<React.SetStateAction<ZodiacWheelOptions>>;
  mainPlanetAngles: PlanetAngle[];
  otherPlanetAngles: PlanetAngle[];
  mainCuspAngles: CuspAngle[];
  otherCuspAngles: CuspAngle[];
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
  const { user } = useAuth();
  const [chart, setChart] = useState<MultiChart | undefined>();
  const { getSynastryChart, getTransitChart } = useCharts();
  const { mainProfile, profiles } = useBirthProfiles();
  const [mainPlanetAngles, setMainPlanetAngles] = useState<PlanetAngle[]>([]);
  const [otherPlanetAngles, setOtherPlanetAngles] = useState<PlanetAngle[]>([]);
  const [signAngles, setSignAngles] = useState<SignAngle[]>([]);
  const [mainCuspAngles, setMainCuspAngles] = useState<CuspAngle[]>([]);
  const [otherCuspAngles, setOtherCuspAngles] = useState<CuspAngle[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);

  const now = new Date();
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
    datetimeOptions: {
      date:
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0"),
      time: now.toTimeString().slice(0, 8),
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
    if (type === "synastry") fetchSynastryChart();
    else if (type === "transit") fetchCurrentChart();
  }, [
    settings.profileId,
    settings.otherProfileId,
    settings.ayanamsa,
    settings.houseSystem,
    settings.zodiacSystem,
  ]);

  const calcCuspAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps["cusp1"].position;

    const main = Object.entries(chart.main.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: (cusp.position - ascPos + 360) % 360,
    }));
    const other = Object.entries(chart.other.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: (cusp.position - ascPos + 360) % 360,
    }));

    return { main, other };
  };

  const calcPlanetAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps["cusp1"].position;

    const rawMainPlanetAngles = Object.entries(chart.main.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const rawOtherPlanetAngles = Object.entries(chart.other.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const main: PlanetAngle[] = [];
    rawMainPlanetAngles.forEach((planet, i) => {
      if (i === 0) {
        main.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = main[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        main.push({ ...planet, glyphAngle });
      }
    });

    const other: PlanetAngle[] = [];
    rawOtherPlanetAngles.forEach((planet, i) => {
      if (i === 0) {
        other.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = other[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        other.push({ ...planet, glyphAngle });
      }
    });

    return { main, other };
  };

  const calcSignAngles = (chart: MultiChart) => {
    const ascSign = chart.main.cusps["cusp1"].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.main.cusps["cusp1"].deg_in_sign;
    return ZodiacSigns.map((s, i) => {
      const offset = (i - ascIndex + 12) % 12;
      const angle =
        Math.round(((startAngleFirstSign + offset * 30 + 360) % 360) * 100) /
        100;
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
        signAngles,
        aspects,
        type,
      }}
    >
      {children}
    </MultiWheelContext.Provider>
  );
};
