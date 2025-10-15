import { useState, useEffect } from "react";
import type { SignAngle } from "../../components/wheel/layers/Signs";
import type { CuspType, Cusp } from "../../types/cusp";
import type { PlanetName, Planet } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";

export type signDescriptions = Partial<Record<ZodiacSign, string>>;
export type planetDescriptions = Partial<Record<PlanetName, string>>;
export type houseDescriptions = Partial<Record<CuspType, string>>;

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
        body: JSON.stringify({
          ...params,
          type: type === "moment" ? "time" : type,
        }),
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
