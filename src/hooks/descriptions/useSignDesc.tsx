import { useState, useEffect } from "react";
import type { Cusp } from "../../types/cusp";
import type { Planet } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";
import type { houseDescriptions, planetDescriptions } from "./useHouseDesc";

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

