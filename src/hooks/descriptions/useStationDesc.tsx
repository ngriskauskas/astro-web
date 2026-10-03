import type { PlanetName } from "../../types/planet";
import { useGeneratedDescriptions } from "./useGeneratedDescriptions";

interface StationDescParams {
  planet: PlanetName;
  retrograde: boolean;
}

export const useStationDesc = (params: StationDescParams) => {
  const { loading, descriptions, error } = useGeneratedDescriptions([
    {
      type: "timing",
      timeScale: "LONG_TERM",
      event: {
        type: "station",
        planet: params.planet,
        retrograde: params.retrograde,
      },
    },
  ]);

  return { loading, error, description: descriptions[0] ?? "" };
};
