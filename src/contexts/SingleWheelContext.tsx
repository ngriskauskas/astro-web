import { createContext, useEffect, useState, type ReactNode } from "react";
import { type SingleChart, useCharts } from "./ChartContext";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import { type CuspAngle } from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { useAuth } from "./AuthContext";
import { type Aspect } from "../types/aspect";
import type { Planet, PlanetName } from "../types/planet";

export interface SingleWheelContextType {
  settings: ZodiacWheelOptions;
  setSettings: React.Dispatch<React.SetStateAction<ZodiacWheelOptions>>;
  planetAngles: PlanetAngle[];
  cuspAngles: CuspAngle[];
  signAngles: SignAngle[];
  aspects: Aspect[];
  type: "natal" | "time";
  getPlanetsInSign: (sign: ZodiacSign) => Planet[];
  getPlanetsInHouse: (house: string) => Planet[];
  getPlanetAspects: (planet: PlanetName) => Aspect[];
  getPlanet: (planet: PlanetName) => Planet;
  getPlanetHouse: (planet: PlanetName) => number;
}

export const SingleWheelContext = createContext<
  SingleWheelContextType | undefined
>(undefined);

export const SingleWheelProvider = ({
  children,
  type,
}: {
  children: ReactNode;
  type: "natal" | "time";
}) => {
  const { user } = useAuth();
  const [chart, setChart] = useState<SingleChart | undefined>();
  const { getNatalChart, getCurrentChart } = useCharts();
  const { mainProfile } = useBirthProfiles();
  const [planetAngles, setPlanetAngles] = useState<PlanetAngle[]>([]);
  const [signAngles, setSignAngles] = useState<SignAngle[]>([]);
  const [cuspAngles, setCuspAngles] = useState<CuspAngle[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);

  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: mainProfile?.id,
    zodiacSystem: "tropical",
    houseSystem: "placidus",
    ayanamsa: "lahiri",
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
    const now = new Date();
    const localISODate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const data = await getCurrentChart({
      location: { lon: user!.longitude, lat: user!.latitude },
      time: now.toTimeString().slice(0, 8),
      date: localISODate,
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
  ]);

  const calcCuspAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    return Object.entries(chart.cusps).map(([_key, cusp]) => ({
      ...cusp,
      angle: (cusp.position - ascPos + 360) % 360,
    }));
  };
  const calcPlanetAngles = (chart: SingleChart) => {
    const ascPos = chart.cusps["cusp1"].position;

    const planetAngles = Object.entries(chart.planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

    const adjusted: PlanetAngle[] = [];
    planetAngles.forEach((planet, i) => {
      if (i === 0) {
        adjusted.push({ ...planet, glyphAngle: planet.angle });
      } else {
        const prev = adjusted[i - 1];
        const diff = planet.angle - prev.glyphAngle;
        const glyphAngle = diff <= 4 ? prev.glyphAngle + 5 : planet.angle;
        adjusted.push({ ...planet, glyphAngle });
      }
    });

    return adjusted;
  };

  const calcSignAngles = (chart: SingleChart) => {
    const ascSign = chart.cusps["cusp1"].sign;

    const ascIndex = ZodiacSigns.indexOf(ascSign);

    const startAngleFirstSign = -chart.cusps["cusp1"].deg_in_sign;
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
    setPlanetAngles(calcPlanetAngles(chart));
    setCuspAngles(calcCuspAngles(chart));
    setSignAngles(calcSignAngles(chart));
    setAspects(chart.aspects);
  }, [chart]);

  const getPlanetsInSign = (sign: ZodiacSign) => {
    const planets = planetAngles.filter((x) => x.sign === sign);
    return (planets as Planet[]) ?? [];
  };

  const getPlanetsInHouse = (house: string) => {
    const houseNum = parseInt(house);
    const nextHouseNum = houseNum === 12 ? 1 : houseNum + 1;
    const startCusp = cuspAngles.find(
      (x) => x.name.replace("cusp", "") === String(houseNum),
    );
    const endCusp = cuspAngles.find(
      (x) => x.name.replace("cusp", "") === String(nextHouseNum),
    );

    const start = startCusp!.position;
    const end = endCusp!.position;
    return planetAngles.filter((planet) => {
      if (start < end) {
        return planet.position >= start && planet.position < end;
      } else {
        return planet.position >= start || planet.position < end;
      }
    });
  };

  const getPlanetAspects = (planet: PlanetName) => {
    return aspects
      .filter((x) => x.planet1.name === planet || x.planet2.name === planet)
      .filter(({ type, orb }) => orb <= settings.aspectOptions[type].minOrb)
      .map((x) => {
        if (x.planet1.name === planet) return x;
        return { ...x, planet1: x.planet2, planet2: x.planet1 };
      })
      .sort((a, b) => a.orb - b.orb);
  };

  const getPlanet = (planet: PlanetName) => {
    return planetAngles.find((x) => x.name === planet)!;
  };

  const getPlanetHouse = (planet: PlanetName): number => {
    for (let house = 1; house <= 12; house++) {
      const planetsInHouse = getPlanetsInHouse(String(house));
      if (planetsInHouse.some((p) => p.name === planet)) {
        return house;
      }
    }
    throw new Error(`House not found for planet ${planet}`);
  };

  return (
    <SingleWheelContext.Provider
      value={{
        settings,
        setSettings,
        planetAngles,
        signAngles,
        cuspAngles,
        aspects,
        type,
        getPlanetsInSign,
        getPlanetsInHouse,
        getPlanetAspects,
        getPlanet,
        getPlanetHouse,
      }}
    >
      {children}
    </SingleWheelContext.Provider>
  );
};
