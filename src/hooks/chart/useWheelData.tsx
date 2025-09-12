import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { isMulti, useWheel } from "../useWheel";
import * as multi from "./multiWheelData";
import * as single from "./singleWheelData";

export const useWheelData = (owner?: OwnerType) => {
  const ctx = useWheel();

  if (isMulti(ctx)) {
    return {
      getPlanetsInSign: (sign: ZodiacSign) => multi.getPlanetsInSign(ctx, sign),
      getPlanetsInHouse: (house: CuspType) =>
        multi.getPlanetsInHouse(ctx, house, owner),
      getPlanetAspects: (planet: PlanetName) =>
        multi.getPlanetAspects(ctx, planet, owner),
      getPlanet: (planet: PlanetName) => multi.getPlanet(ctx, planet, owner),
      getPlanetHouse: (planet: PlanetName) =>
        multi.getPlanetHouse(ctx, planet, owner),
      getHouse: (house: CuspType) => multi.getHouse(ctx, house, owner),
      getSignsInHouse: (house: CuspType) =>
        multi.getSignsInHouse(ctx, house, owner),
      getHousesInSign: (sign: ZodiacSign) => multi.getHousesInSign(ctx, sign),
    };
  } else {
    return {
      getPlanetsInSign: (sign: ZodiacSign) =>
        single.getPlanetsInSign(ctx, sign),
      getPlanetsInHouse: (house: CuspType) =>
        single.getPlanetsInHouse(ctx, house),
      getPlanetAspects: (planet: PlanetName) =>
        single.getPlanetAspects(ctx, planet),
      getPlanet: (planet: PlanetName) => single.getPlanet(ctx, planet),
      getPlanetHouse: (planet: PlanetName) =>
        single.getPlanetHouse(ctx, planet),
      getHouse: (house: CuspType) => single.getHouse(ctx, house),
      getSignsInHouse: (house: CuspType) => single.getSignsInHouse(ctx, house),
      getHousesInSign: (sign: ZodiacSign) => single.getHousesInSign(ctx, sign),
    };
  }
};
