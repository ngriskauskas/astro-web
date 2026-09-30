import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { Cusp } from "../../types/cusp";
import type { PlanetName, Planet } from "../../types/planet";
import { useWheel } from "../useWheel";
import {
  getChartSource,
  useGeneratedDescriptions,
  type DescriptionContext,
} from "./useGeneratedDescriptions";

export type planetDescriptions = Partial<Record<PlanetName, string>>;

export interface HouseDesc {
  planets?: planetDescriptions;
  mainPlanets?: planetDescriptions;
  otherPlanets?: planetDescriptions;
}

interface HouseDescParams {
  house: Cusp;
  planets?: Planet[];
  mainPlanets?: Planet[];
  otherPlanets?: Planet[];
  owner?: OwnerType;
}

export const useHouseDesc = (params: HouseDescParams) => {
  const { type } = useWheel();
  const entries = [
    ...(params.planets ?? []).map((planet) => ({ group: "planets", owner: params.owner, planet })),
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
      sign: planet.sign,
      house: params.house.name,
      retrograde: planet.retrograde,
      stationary: planet.stationary,
    },
  }));
  const { loading, descriptions } = useGeneratedDescriptions(contexts);
  const getDescriptions = (group: string) =>
    Object.fromEntries(
      entries.flatMap(({ group: entryGroup, planet }, index) =>
        entryGroup === group ? [[planet.name, descriptions[index] ?? ""]] : [],
      ),
    );

  const houseDesc: HouseDesc = {
    planets: getDescriptions("planets") as HouseDesc["planets"],
    mainPlanets: getDescriptions("mainPlanets") as HouseDesc["mainPlanets"],
    otherPlanets: getDescriptions("otherPlanets") as HouseDesc["otherPlanets"],
  };

  return { loading, houseDesc };
};
