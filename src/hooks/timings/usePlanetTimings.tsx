import type { CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useWheelData } from "../chart/useWheelData";
import { useTransitPlanetDesc } from "../descriptions/useTransitPlanetDesc";
import { useCurrentTimings } from "./useTimings";

export const usePlanetTimings = ({ planet }: { planet: PlanetName }) => {
  const {
    loading,
    timings: { aspects },
  } = useCurrentTimings();

  const { loading: wheelLoading, getMainOfOtherPlanet } = useWheelData();

  const { house, planetData } = !wheelLoading
    ? getMainOfOtherPlanet!(planet)
    : {
      house: 1 as CuspType,
      planetData: { name: "sun" as PlanetName, sign: "aries" as ZodiacSign },
    };

  const { loading: descLoading, transitPlanetDesc } = useTransitPlanetDesc(
    {
      planet: planetData!.name,
      sign: planetData!.sign,
      house,
    },
    !wheelLoading,
  );

  const planetAspects = aspects.filter((x) => x.planet2 === planet);

  return {
    loading: loading || descLoading || wheelLoading,
    house,
    planetAspects,
    planetData,
    transitPlanetDesc,
  };
};
