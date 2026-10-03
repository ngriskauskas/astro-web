import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { Planet } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useWheel } from "../useWheel";
import {
  getChartSource,
  useGeneratedDescriptions,
  type DescriptionContext,
} from "./useGeneratedDescriptions";
import type { planetDescriptions } from "./useHouseDesc";

export interface SignDesc {
  planets?: planetDescriptions;
  mainPlanets?: planetDescriptions;
  otherPlanets?: planetDescriptions;
}

interface SignDescParams {
  sign: ZodiacSign;
  planets?: Planet[];
  mainPlanets?: Planet[];
  otherPlanets?: Planet[];
}

export const useSignDesc = (params: SignDescParams) => {
  const { type } = useWheel();
  const entries = [
    ...(params.planets ?? []).map((planet) => ({ group: "planets", owner: undefined, planet })),
    ...(params.mainPlanets ?? []).map((planet) => ({
      group: "mainPlanets",
      owner: "main" as OwnerType,
      planet,
    })),
    ...(params.otherPlanets ?? []).map((planet) => ({
      group: "otherPlanets",
      owner: "other" as OwnerType,
      planet,
    })),
  ];
  const contexts: DescriptionContext[] = entries.map(({ planet, owner }) => ({
    type: "placement",
    subject: {
      chart: getChartSource(type, owner),
      point: { type: "planet", name: planet.name },
      sign: params.sign,
      house: planet.house,
      retrograde: planet.retrograde,
      stationary: planet.stationary,
    },
  }));
  const { loading, descriptions, error } = useGeneratedDescriptions(contexts);
  const getPlanetDescriptions = (group: string) =>
    Object.fromEntries(
      entries.flatMap(({ group: entryGroup, planet }, index) =>
        entryGroup === group ? [[planet.name, descriptions[index] ?? ""]] : [],
      ),
    );

  const signDesc: SignDesc = {
    planets: getPlanetDescriptions("planets"),
    mainPlanets: getPlanetDescriptions("mainPlanets"),
    otherPlanets: getPlanetDescriptions("otherPlanets"),
  };

  return { loading, error, signDesc };
};
