import { useState, useEffect } from "react";
import type { CuspType } from "../../types/cusp";
import type { Planet } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";

export interface PlanetDesc {
  retrograde?: string;
  sign: string;
  house: string;
  combined: string;
}

interface PlanetDescParams {
  planet: Planet;
  sign: ZodiacSign;
  house: CuspType;
}

export const usePlanetDesc = (params: PlanetDescParams) => {
  const [loading, setLoading] = useState(false);
  const [planetDesc, setPlanetDesc] = useState<PlanetDesc>({
    retrograde: "temp",
    sign: "temp",
    house: "temp",
    combined: "temp",
  });

  const { type } = useWheel();

  // useEffect(() => {
  //   const fetchDesc = async () => {
  //     setLoading(true);
  //     const data = await apiFetch("/descriptions/planet", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         ...params,
  //         type: type === "moment" ? "time" : type,
  //       }),
  //     });
  //     setPlanetDesc(data);
  //     setLoading(false);
  //   };

  //   fetchDesc();
  // }, [params.sign, params.planet, params.house, type]);

  return { loading, planetDesc };
};
