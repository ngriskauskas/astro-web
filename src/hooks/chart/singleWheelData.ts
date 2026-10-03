import type { CuspAngle } from "../../components/wheel/layers/Houses";
import type { SignAngle } from "../../components/wheel/layers/Signs";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import type { Aspect } from "../../types/aspect";
import type { CuspType, KeyType } from "../../types/cusp";
import type { Planet, PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import type { HouseSystem } from "../../types/house-system";
import type { ObjectOptions } from "../../types/astrologySettings";
import { hiddenPlanets } from "../../utils/hiddenPlanets";

export const getPlanetsInSign = (ctx: SingleWheelContextType, sign: ZodiacSign) => {
  const planets = ctx.planetAngles.filter((x) => x.sign === sign);
  return (planets as Planet[]) ?? [];
};

export const getPlanetsInHouse = (ctx: SingleWheelContextType, houseNum: CuspType): Planet[] => {
  return ctx.planetAngles.filter((planet) => planet.house === houseNum);
};

export const getPlanetAspects = (ctx: SingleWheelContextType, planet: PlanetName) => {
  return ctx.aspects
    .filter((x) => x.point1.value.name === planet || x.point2.value.name === planet)
    .map((x) => {
      if (x.point1.value.name === planet) return x;
      return { ...x, point1: x.point2, point2: x.point1 };
    })
    .sort((a, b) => a.orb - b.orb);
};

export const getPlanet = (ctx: SingleWheelContextType, planet: PlanetName) => {
  return ctx.planetAngles.find((x) => x.name === planet)!;
};

export const getHouse = (ctx: SingleWheelContextType, house: number) => {
  return ctx.cuspAngles.find((x) => x.name === house)!;
};

const inSign = (deg: number, { angle }: SignAngle) => {
  const signStart = angle;
  const signEnd = (angle + 30) % 360;

  if (signStart < signEnd) {
    return deg > signStart && deg < signEnd;
  } else {
    return deg > signStart || deg < signEnd;
  }
};

const inHouse = (deg: number, { angle, endAngle }: CuspAngle) => {
  if (angle < endAngle) {
    return deg > angle && deg < endAngle;
  } else {
    return deg > angle || deg < endAngle;
  }
};

export const getSignsInHouse = (
  ctx: SingleWheelContextType,
  houseNum: CuspType,
  houseSystem: HouseSystem,
) => {
  const house = getHouse(ctx, houseNum);

  if (houseSystem === "WHOLE_SIGN") {
    return ctx.signAngles.filter((x) => x.angle === house.angle);
  }

  return ctx.signAngles.filter((x) => {
    const signStart = x.angle;
    const signEnd = (x.angle + 30) % 360;

    return (
      inSign(house.angle, x) ||
      inSign(house.endAngle, x) ||
      (inHouse(signStart, house) && inHouse(signEnd, house))
    );
  });
};

export const getHousesInSign = (
  ctx: SingleWheelContextType,
  sign: ZodiacSign,
  houseSystem: HouseSystem,
) => {
  const signAngle = ctx.signAngles.find((s) => s.sign === sign)!;

  if (houseSystem === "WHOLE_SIGN") {
    return ctx.cuspAngles.filter(({ angle }) => angle === signAngle.angle);
  }

  return ctx.cuspAngles.filter((house) => {
    return (
      inSign(house.angle, signAngle) ||
      inSign(house.endAngle, signAngle) ||
      (inHouse(signAngle.angle, house) && inHouse((signAngle.angle + 30) % 360, house))
    );
  });
};

export const getSignInKeyAngle = (ctx: SingleWheelContextType, keyAngle: KeyType): ZodiacSign => {
  const angleObj = ctx.keyAngles.find((ka) => ka.name === keyAngle)!;
  return angleObj.sign;
};

// Aspects without those to an object the user has turned off in their settings.
export const getFilteredAspects = (ctx: SingleWheelContextType, objectOptions: ObjectOptions): Aspect[] => {
  const hidden = hiddenPlanets(objectOptions);
  return ctx.aspects.filter(
    ({ point1, point2 }) => !hidden.includes(point1.value.name) && !hidden.includes(point2.value.name),
  );
};
