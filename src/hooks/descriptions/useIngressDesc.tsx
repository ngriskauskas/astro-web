import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useGeneratedDescriptions } from "./useGeneratedDescriptions";

export interface IngressDesc {
  description: string;
}

interface IngressDescParams {
  planet: PlanetName;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
}

export const useIngressDesc = (params: IngressDescParams) => {
  const { loading, descriptions, error } = useGeneratedDescriptions([
    {
      type: "timing",
      timeScale: "LONG_TERM",
      event: {
        type: "ingress",
        planet: params.planet,
        fromSign: params.fromSign,
        toSign: params.toSign,
      },
    },
  ]);
  const ingressDesc: IngressDesc = { description: descriptions[0] ?? "" };

  return { loading, error, ingressDesc };
};
