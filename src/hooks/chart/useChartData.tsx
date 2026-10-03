import type { SignAngle } from "../../components/wheel/layers/Signs";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { Cusp, CuspType, KeyType } from "../../types/cusp";
import type { Planet, PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useWheelData } from "./useWheelData";

const isMultiResult = (result: any[] | [any[], any[]]) =>
  Array.isArray(result) && Array.isArray(result[0]);

export const usePlanetData = (planetName: PlanetName, owner?: OwnerType) => {
  const { getPlanetAspects, getPlanet } = useWheelData(owner);

  return {
    aspects: getPlanetAspects(planetName),
    planet: getPlanet(planetName),
  };
};

export const useHouseData = (
  houseName: CuspType,
  owner?: OwnerType,
): {
  house: Cusp;
  mainPlanets?: Planet[];
  otherPlanets?: Planet[];
  planets?: Planet[];
  signs: SignAngle[];
} => {
  const { getPlanetsInHouse, getHouse, getSignsInHouse } = useWheelData(owner);

  const result = getPlanetsInHouse(houseName);

  return {
    house: getHouse(houseName),
    mainPlanets: isMultiResult(result) ? (result[0] as Planet[]) : undefined,
    otherPlanets: isMultiResult(result) ? (result[1] as Planet[]) : undefined,
    planets: isMultiResult(result) ? undefined : (result as Planet[]),
    signs: getSignsInHouse(houseName),
  };
};

export const useSignData = (sign: ZodiacSign) => {
  const { getPlanetsInSign, getHousesInSign } = useWheelData();

  const planets = getPlanetsInSign(sign);
  const houses = getHousesInSign(sign);

  return {
    planets: isMultiResult(planets) ? undefined : (planets as Planet[]),
    mainPlanets: isMultiResult(planets) ? (planets[0] as Planet[]) : undefined,
    otherPlanets: isMultiResult(planets) ? (planets[1] as Planet[]) : undefined,
    houses: isMultiResult(houses) ? undefined : (houses as Cusp[]),
    mainHouses: isMultiResult(houses) ? (houses[0] as Cusp[]) : undefined,
    otherHouses: isMultiResult(houses) ? (houses[1] as Cusp[]) : undefined,
  };
};

export const useKeyAngleData = (keyAngle: KeyType, owner?: OwnerType) => {
  const { getSignInKeyAngle } = useWheelData(owner);

  return {
    sign: getSignInKeyAngle(keyAngle),
  };
};
