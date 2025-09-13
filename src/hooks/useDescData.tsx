import { useEffect, useState } from "react";
import type { Planet, PlanetName } from "../types/planet";
import type { Cusp, CuspType } from "../types/cusp";
import type { ZodiacSign } from "../types/zodiac";
import { apiFetch } from "../utils/api";
import type { SignAngle } from "../components/wheel/layers/Signs";
import { useWheel } from "./useWheel";
import type { Aspect, AspectType } from "../types/aspect";

type signDescriptions = Partial<Record<ZodiacSign, string>>;
type planetDescriptions = Partial<Record<PlanetName, string>>;
type houseDescriptions = Partial<Record<CuspType, string>>;

export interface PlanetDesc {
  retrograde?: string;
  sign: string;
  house: string;
}

interface PlanetDescParams {
  planet: Planet;
  sign: ZodiacSign;
  house: CuspType;
}

export interface HouseDesc {
  signs: signDescriptions;
  planets?: planetDescriptions;
  mainPlanets?: planetDescriptions;
  otherPlanets?: planetDescriptions;
}

interface HouseDescParams {
  house: Cusp;
  signs: SignAngle[];
  planets?: Planet[];
  mainPlanets?: Planet[];
  otherPlanets?: Planet[];
}

export interface SignDesc {
  houses?: houseDescriptions;
  mainHouses?: houseDescriptions;
  otherHouses?: houseDescriptions;
  planets?: planetDescriptions;
  mainPlanets?: planetDescriptions;
  otherPlanets?: planetDescriptions;
}

interface SignDescParams {
  sign: ZodiacSign;
  houses?: Cusp[];
  mainHouses?: Cusp[];
  otherHouses?: Cusp[];
  planets?: Planet[];
  mainPlanets?: Planet[];
  otherPlanets?: Planet[];
}

export interface AspectDesc {
  description: string;
}

interface AspectDescParams {
  aspect: AspectType;
  planet1: PlanetName;
  planet2: PlanetName;
}

export const usePlanetDesc = (params: PlanetDescParams) => {
  const [loading, setLoading] = useState(true);
  const [planetDesc, setPlanetDesc] = useState<PlanetDesc>();

  const { type } = useWheel();

  useEffect(() => {
    setLoading(true);
    const fetchDesc = async () => {
      const data = await apiFetch("/descriptions/planet", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setPlanetDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.sign, params.planet, params.house, type]);

  return { loading, planetDesc };
};

export const useHouseDesc = (params: HouseDescParams) => {
  const [loading, setLoading] = useState(true);
  const [houseDesc, setHouseDesc] = useState<HouseDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      const data = await apiFetch("/descriptions/house", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setHouseDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [
    params.house,
    params.signs,
    params.planets,
    params.mainPlanets,
    params.otherPlanets,
    type,
  ]);

  return { loading, houseDesc };
};

export const useSignDesc = (params: SignDescParams) => {
  const [loading, setLoading] = useState(true);
  const [signDesc, setSignDesc] = useState<SignDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      const data = await apiFetch("/descriptions/sign", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setSignDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [
    params.sign,
    params.otherPlanets,
    params.mainPlanets,
    params.planets,
    params.houses,
    params.mainHouses,
    params.otherHouses,
    type,
  ]);

  return { loading, signDesc };
};

export const useAspectDesc = (params: AspectDescParams) => {
  const [loading, setLoading] = useState(true);
  const [aspectDesc, setAspectDesc] = useState<AspectDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      const data = await apiFetch("/descriptions/aspect", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setAspectDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.aspect, type]);

  return { loading, aspectDesc };
};
