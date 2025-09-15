import type { CuspAngle } from "../../components/wheel/layers/Houses";
import type { SignAngle } from "../../components/wheel/layers/Signs";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import type { Aspect } from "../../types/aspect";
import type { CuspType, KeyType } from "../../types/cusp";
import type { Planet, PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";

export const getPlanetsInSign = (
  ctx: SingleWheelContextType,
  sign: ZodiacSign,
) => {
  const planets = ctx.planetAngles.filter((x) => x.sign === sign);
  return (planets as Planet[]) ?? [];
};

export const getPlanetsInHouse = (
  ctx: SingleWheelContextType,
  houseNum: CuspType,
): Planet[] => {
  const { angle: start, endAngle: end } = ctx.cuspAngles.find(
    (x) => x.name === houseNum,
  )!;

  return ctx.planetAngles.filter((planet) => {
    if (start < end) {
      return planet.angle >= start && planet.angle < end;
    } else {
      return planet.angle >= start || planet.angle < end;
    }
  });
};

export const getPlanetAspects = (
  ctx: SingleWheelContextType,
  planet: PlanetName,
) => {
  return ctx.aspects
    .filter((x) => x.planet1.name === planet || x.planet2.name === planet)
    .filter(({ type, orb }) => orb <= ctx.settings.aspectOptions[type].minOrb)
    .map((x) => {
      if (x.planet1.name === planet) return x;
      return { ...x, planet1: x.planet2, planet2: x.planet1 };
    })
    .sort((a, b) => a.orb - b.orb);
};

export const getPlanet = (ctx: SingleWheelContextType, planet: PlanetName) => {
  return ctx.planetAngles.find((x) => x.name === planet)!;
};

export const getPlanetHouse = (
  ctx: SingleWheelContextType,
  planet: PlanetName,
): CuspType => {
  for (let house = 1; house <= 12; house++) {
    const planetsInHouse = getPlanetsInHouse(ctx, house as CuspType);
    if (planetsInHouse.some((p) => p.name === planet)) {
      return house as CuspType;
    }
  }
  throw new Error(`House not found for planet ${planet}`);
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
) => {
  const house = getHouse(ctx, houseNum);

  if (ctx.settings.houseSystem === "whole_sign") {
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
) => {
  const signAngle = ctx.signAngles.find((s) => s.sign === sign)!;

  if (ctx.settings.houseSystem === "whole_sign") {
    return ctx.cuspAngles.filter(({ angle }) => angle === signAngle.angle);
  }

  return ctx.cuspAngles.filter((house) => {
    return (
      inSign(house.angle, signAngle) ||
      inSign(house.endAngle, signAngle) ||
      (inHouse(signAngle.angle, house) &&
        inHouse((signAngle.angle + 30) % 360, house))
    );
  });
};

export const getSignInKeyAngle = (
  ctx: SingleWheelContextType,
  keyAngle: KeyType,
): ZodiacSign => {
  const angleObj = ctx.keyAngles.find((ka) => ka.name === keyAngle)!;
  return angleObj.sign;
};

export const getFilteredAspects = (ctx: SingleWheelContextType): Aspect[] => {
  const aspectOptions = ctx.settings.aspectOptions;
  return ctx.aspects.filter(
    ({ type, orb }) =>
      aspectOptions[type].show && aspectOptions[type].minOrb >= orb,
  );
};
