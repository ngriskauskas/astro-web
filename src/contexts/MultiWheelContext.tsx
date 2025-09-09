import { createContext, useEffect, useState, type ReactNode } from "react";
import { type MultiChart, useCharts } from "./ChartContext";
import { type ZodiacWheelOptions } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "./BirthProfilesContext";
import { type PlanetAngle } from "../components/wheel/layers/Planets";
import { type CuspAngle } from "../components/wheel/layers/Houses";
import { type SignAngle } from "../components/wheel/layers/Signs";
import { useAuth } from "./AuthContext";
import { ZodiacSigns, type ZodiacSign } from "../types/zodiac";
import { type Aspect } from "../types/aspect";
import type { Planet, PlanetName } from "../types/planet";

type OwnerType = "main" | "other";

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
  getPlanetsInSign: (sign: ZodiacSign) => [Planet[], Planet[]];
  getPlanetsInHouse: (house: string, owner: OwnerType) => [Planet[], Planet[]];
  getPlanetAspects: (planet: PlanetName, owner: OwnerType) => Aspect[];
  getPlanet: (planet: PlanetName, owner: OwnerType) => Planet;
  getPlanetHouse: (planet: PlanetName, owner: OwnerType) => number;
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
    datetimeOptions:
      type === "synastry"
        ? undefined
        : {
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
    settings.datetimeOptions,
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

  const calcInitialPlanetAngles = (
    ascPos: number,
    planets: Record<string, Planet>,
  ) =>
    Object.entries(planets)
      .map(([_key, planet]) => ({
        ...planet,
        angle: (planet.position - ascPos + 360) % 360,
        glyphAngle: (planet.position - ascPos + 360) % 360,
      }))
      .sort((a, b) => a.angle - b.angle);

  const adjustGlyphAngles = (planets: PlanetAngle[]) => {
    const main: PlanetAngle[] = [];
    planets.forEach((planet, i) => {
      if (i === 0) main.push({ ...planet, glyphAngle: planet.angle });
      else {
        const prev = main[i - 1];
        const diff = ((planet.angle - prev.glyphAngle + 540) % 360) - 180;
        const glyphAngle =
          Math.abs(diff) <= 4.5 ? (prev.glyphAngle + 5.5) % 360 : planet.angle;
        main.push({ ...planet, glyphAngle });
      }
    });
    planets.forEach((planet, i) => {
      const prev = i === 0 ? main[main.length - 1] : main[i - 1];
      const diff = ((planet.angle - prev.glyphAngle + 540) % 360) - 180;
      const glyphAngle =
        Math.abs(diff) <= 4.5 ? (prev.glyphAngle + 5.5) % 360 : planet.angle;
      main[i] = { ...planet, glyphAngle };
    });

    return main;
  };

  const calcPlanetAngles = (chart: MultiChart) => {
    const ascPos = chart.main.cusps["cusp1"].position;

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

  const getPlanetsInSign = (sign: ZodiacSign): [Planet[], Planet[]] => {
    const mainPlanets = mainPlanetAngles.filter((x) => x.sign === sign);
    const otherPlanets = otherPlanetAngles.filter((x) => x.sign === sign);
    return [mainPlanets, otherPlanets];
  };

  const computePlanets = (
    planetAngles: PlanetAngle[],
    cuspAngles: CuspAngle[],
    house: string,
  ) => {
    const houseNum = parseInt(house);
    const nextHouseNum = houseNum === 12 ? 1 : houseNum + 1;

    const startCusp = cuspAngles.find(
      (x) => x.name.replace("cusp", "") === String(houseNum),
    );
    const endCusp = cuspAngles.find(
      (x) => x.name.replace("cusp", "") === String(nextHouseNum),
    );

    if (!startCusp || !endCusp) return [];

    const start = startCusp.position;
    const end = endCusp.position;

    return planetAngles.filter((planet) => {
      if (start < end) {
        return planet.position >= start && planet.position < end;
      } else {
        return planet.position >= start || planet.position < end;
      }
    });
  };

  const getPlanetsInHouse = (
    house: string,
    owner: OwnerType,
  ): [Planet[], Planet[]] => {
    const mainPlanets = computePlanets(
      mainPlanetAngles,
      owner === "main" ? mainCuspAngles : otherCuspAngles,
      house,
    );
    const otherPlanets = computePlanets(
      otherPlanetAngles,
      owner === "main" ? mainCuspAngles : otherCuspAngles,
      house,
    );
    return [mainPlanets, otherPlanets];
  };

  const getPlanetAspects = (planet: PlanetName, owner: OwnerType) => {
    return aspects
      .filter((x) =>
        owner === "main"
          ? x.planet1.name === planet
          : x.planet2.name === planet,
      )
      .filter(({ type, orb }) => orb <= settings.aspectOptions[type].minOrb)
      .map((x) => {
        if (x.planet1.name === planet) return x;
        return { ...x, planet1: x.planet2, planet2: x.planet1 };
      })
      .sort((a, b) => a.orb - b.orb);
  };

  const getPlanet = (planet: PlanetName, owner: OwnerType): PlanetAngle => {
    const angles = owner === "other" ? otherPlanetAngles : mainPlanetAngles;
    return angles.find((x) => x.name === planet)!;
  };

  const getPlanetHouse = (planet: PlanetName, owner: OwnerType): number => {
    const angles = owner === "other" ? otherPlanetAngles : mainPlanetAngles;
    const cusps = owner === "other" ? otherCuspAngles : mainCuspAngles;

    for (let house = 1; house <= 12; house++) {
      const planetsInHouse = computePlanets(angles, cusps, String(house));
      if (planetsInHouse.some((p) => p.name === planet)) {
        return house;
      }
    }

    throw new Error(`House not found for planet ${planet} (owner: ${owner})`);
  };
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
        getPlanetAspects,
        getPlanetsInHouse,
        getPlanetsInSign,
        getPlanet,
        getPlanetHouse,
      }}
    >
      {children}
    </MultiWheelContext.Provider>
  );
};
