import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { CuspType, KeyType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { isMulti, useWheel } from "../useWheel";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import * as multi from "./multiWheelData";
import * as single from "./singleWheelData";

export const useWheelData = (owner?: OwnerType) => {
  const ctx = useWheel();
  const {
    settings: { houseSystem },
  } = useChartSettings();

  if (isMulti(ctx)) {
    return {
      loading: ctx.mainPlanetAngles.length === 0,
      getPlanetsInSign: (sign: ZodiacSign) => multi.getPlanetsInSign(ctx, sign),
      getPlanetsInHouse: (house: CuspType) => multi.getPlanetsInHouse(ctx, house, owner),
      getPlanetAspects: (planet: PlanetName) => multi.getPlanetAspects(ctx, planet, owner),
      getPlanet: (planet: PlanetName) => multi.getPlanet(ctx, planet, owner),
      getHouse: (house: CuspType) => multi.getHouse(ctx, house, owner),
      getSignsInHouse: (house: CuspType) => multi.getSignsInHouse(ctx, house, owner, houseSystem),
      getHousesInSign: (sign: ZodiacSign) => multi.getHousesInSign(ctx, sign, houseSystem),
      getSignInKeyAngle: (keyAngle: KeyType) => multi.getSignInKeyAngle(ctx, keyAngle, owner),
      getFilteredAspects: () => multi.getFilteredAspects(ctx),
      getMainOfOtherPlanet: (planet: PlanetName) => multi.getMainOfOtherPlanet(ctx, planet),
    };
  } else {
    return {
      loading: ctx.planetAngles.length === 0,
      getPlanetsInSign: (sign: ZodiacSign) => single.getPlanetsInSign(ctx, sign),
      getPlanetsInHouse: (house: CuspType) => single.getPlanetsInHouse(ctx, house),
      getPlanetAspects: (planet: PlanetName) => single.getPlanetAspects(ctx, planet),
      getPlanet: (planet: PlanetName) => single.getPlanet(ctx, planet),
      getHouse: (house: CuspType) => single.getHouse(ctx, house),
      getSignsInHouse: (house: CuspType) => single.getSignsInHouse(ctx, house, houseSystem),
      getHousesInSign: (sign: ZodiacSign) => single.getHousesInSign(ctx, sign, houseSystem),
      getSignInKeyAngle: (keyAngle: KeyType) => single.getSignInKeyAngle(ctx, keyAngle),
      getFilteredAspects: () => single.getFilteredAspects(ctx),
    };
  }
};
