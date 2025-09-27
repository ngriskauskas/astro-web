import { useState, useEffect } from "react";
import type { CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";

export interface TransitPlanetDesc {
  description: string;
}

interface TransitPlanetDescParams {
  planet: PlanetName;
  sign: ZodiacSign;
  house: CuspType;
}

export const useTransitPlanetDesc = (
  params: TransitPlanetDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [transitPlanetDesc, setTransitPlanetDesc] =
    useState<TransitPlanetDesc>();

  useEffect(() => {
    if (!enabled) return;

    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/transit-planet", {
        method: "POST",
        body: JSON.stringify(params),
      });
      setTransitPlanetDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.planet, params.sign, params.house, enabled]);

  return { loading, transitPlanetDesc };
};
