import { useState, useEffect } from "react";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";

export interface IngressDesc {
  description: string;
}

interface IngressDescParams {
  planet: PlanetName;
  sign: ZodiacSign;
}

export const useIngressDesc = (params: IngressDescParams, enabled: boolean = true) => {
  const [loading, setLoading] = useState(false);
  const [ingressDesc, setIngressDesc] = useState<IngressDesc>({ description: "temp" });

  const { type } = useWheel();

  // useEffect(() => {
  //   if (!enabled) return;

  //   const fetchDesc = async () => {
  //     setLoading(true);
  //     const data = await apiFetch("/descriptions/ingress", {
  //       method: "POST",
  //       body: JSON.stringify({ ...params, type }),
  //     });
  //     setIngressDesc(data);
  //     setLoading(false);
  //   };

  //   fetchDesc();
  // }, [params.planet, params.sign, type, enabled]);

  return { loading, ingressDesc };
};
