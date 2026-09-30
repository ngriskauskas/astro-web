import type { MoonPhase } from "../../types/moon";
import { useGeneratedDescriptions, type DescriptionMoonPhase } from "./useGeneratedDescriptions";

export interface MoonPhaseDesc {
  description: string;
}

interface MoonPhaseDescParams {
  phase: MoonPhase;
}

export const useMoonPhaseDesc = (params: MoonPhaseDescParams) => {
  const { loading, descriptions } = useGeneratedDescriptions([
    {
      type: "timing",
      timeScale: "DAILY",
      event: {
        type: "moonPhase",
        phase: params.phase.toUpperCase().replace(/ /g, "_") as DescriptionMoonPhase,
      },
    },
  ]);
  const moonPhaseDesc: MoonPhaseDesc = { description: descriptions[0] ?? "" };

  return { loading, moonPhaseDesc };
};
