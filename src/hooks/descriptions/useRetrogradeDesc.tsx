import type { PlanetName } from "../../types/planet";
import { useGeneratedDescriptions } from "./useGeneratedDescriptions";

export interface RetrogradeDesc {
  description: string;
}

interface RetrogradeDescParams {
  planet: PlanetName;
}

export const useRetrogradeDesc = (params: RetrogradeDescParams) => {
  const { loading, descriptions, error } = useGeneratedDescriptions([
    {
      type: "timing",
      timeScale: "LONG_TERM",
      event: {
        type: "retrograde",
        planet: params.planet,
      },
    },
  ]);
  const retrogradeDesc: RetrogradeDesc = { description: descriptions[0] ?? "" };

  return { loading, error, retrogradeDesc };
};
