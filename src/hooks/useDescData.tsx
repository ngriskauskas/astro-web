import { useEffect, useState } from "react";
import type { Planet, PlanetName } from "../types/planet";
import type { Cusp, CuspType, KeyType } from "../types/cusp";
import type { ZodiacSign } from "../types/zodiac";
import { apiFetch } from "../utils/api";
import type { SignAngle } from "../components/wheel/layers/Signs";
import { useWheel } from "./useWheel";
import type { AspectType } from "../types/aspect";
import type { ZodiacSystem } from "../types/zodiac-system";

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

export const usePlanetDesc = (params: PlanetDescParams) => {
  const [loading, setLoading] = useState(true);
  const [planetDesc, setPlanetDesc] = useState<PlanetDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      setLoading(true);
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

export const useHouseDesc = (params: HouseDescParams) => {
  const [loading, setLoading] = useState(true);
  const [houseDesc, setHouseDesc] = useState<HouseDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      setLoading(true);
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

export const useSignDesc = (params: SignDescParams) => {
  const [loading, setLoading] = useState(true);
  const [signDesc, setSignDesc] = useState<SignDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      setLoading(true);
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

export interface AspectDesc {
  description: string;
}

interface AspectDescParams {
  aspect: AspectType;
  planet1: PlanetName;
  planet2: PlanetName;
}

export const useAspectDesc = (
  params: AspectDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [aspectDesc, setAspectDesc] = useState<AspectDesc>();

  const { type } = useWheel();

  useEffect(() => {
    if (!enabled) return;
    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/aspect", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setAspectDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.aspect, type, enabled]);

  return { loading, aspectDesc };
};

export interface RetrogradeDesc {
  description: string;
}

interface RetrogradeDescParams {
  planet: PlanetName;
}

export const useRetrogradeDesc = (
  params: RetrogradeDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [retrogradeDesc, setRetrogradeDesc] = useState<RetrogradeDesc>();

  const { type } = useWheel();

  useEffect(() => {
    if (!enabled) return;
    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/retrograde", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setRetrogradeDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.planet, type, enabled]);

  return { loading, retrogradeDesc };
};

export interface KeyAngleDesc {
  sign: string;
}

interface KeyAngleDescParams {
  sign: ZodiacSign;
  angle: KeyType;
}

export const useKeyAngleDesc = (params: KeyAngleDescParams) => {
  const [loading, setLoading] = useState(true);
  const [keyAngleDesc, setKeyAngleDesc] = useState<KeyAngleDesc>();

  const { type } = useWheel();

  useEffect(() => {
    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/key_angle", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setKeyAngleDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.angle, params.sign, type]);

  return { loading, keyAngleDesc };
};

export interface IngressDesc {
  description: string;
}

interface IngressDescParams {
  planet: PlanetName;
  sign: ZodiacSign;
}

export const useIngressDesc = (
  params: IngressDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [ingressDesc, setIngressDesc] = useState<IngressDesc>();

  const { type } = useWheel();

  useEffect(() => {
    if (!enabled) return;

    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/ingress", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setIngressDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.planet, params.sign, type, enabled]);

  return { loading, ingressDesc };
};
