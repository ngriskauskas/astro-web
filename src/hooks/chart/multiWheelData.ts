import type { CuspAngle } from "../../components/wheel/layers/Houses";
import type { PlanetAngle } from "../../components/wheel/layers/Planets";
import type { SignAngle } from "../../components/wheel/layers/Signs";
import type {
  MultiWheelContextType,
  OwnerType,
} from "../../contexts/MultiWheelContext";
import type { Aspect } from "../../types/aspect";
import type { CuspType, KeyType } from "../../types/cusp";
import type { Planet, PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";

const computePlanets = (
  planetAngles: PlanetAngle[],
  cuspAngles: CuspAngle[],
  houseNum: CuspType,
) => {
  const { angle: start, endAngle: end } = cuspAngles.find(
    (x) => x.name === houseNum,
  )!;

  return planetAngles.filter((planet) => {
    if (start < end) {
      return planet.angle >= start && planet.angle < end;
    } else {
      return planet.angle >= start || planet.angle < end;
    }
  });
};

export const getPlanetsInSign = (
  ctx: MultiWheelContextType,
  sign: ZodiacSign,
): [Planet[], Planet[]] => {
  const mainPlanets = ctx.mainPlanetAngles.filter((x) => x.sign === sign);
  const otherPlanets = ctx.otherPlanetAngles.filter((x) => x.sign === sign);
  return [mainPlanets, otherPlanets];
};

export const getPlanetsInHouse = (
  ctx: MultiWheelContextType,
  house: CuspType,
  owner: OwnerType = "main",
): [Planet[], Planet[]] => {
  const mainPlanets = computePlanets(
    ctx.mainPlanetAngles,
    owner === "main" ? ctx.mainCuspAngles : ctx.otherCuspAngles,
    house,
  );
  const otherPlanets = computePlanets(
    ctx.otherPlanetAngles,
    owner === "main" ? ctx.mainCuspAngles : ctx.otherCuspAngles,
    house,
  );
  return [mainPlanets, otherPlanets];
};

export const getPlanetAspects = (
  ctx: MultiWheelContextType,
  planet: PlanetName,
  owner: OwnerType = "main",
): Aspect[] => {
  return ctx.aspects
    .filter((x) =>
      owner === "main" ? x.planet1.name === planet : x.planet2.name === planet,
    )
    .filter(({ type, orb }) => orb <= ctx.settings.aspectOptions[type].minOrb)
    .map((x) => {
      if (x.planet1.name === planet) return { ...x, planet1Owner: owner };
      return {
        ...x,
        planet1: x.planet2,
        planet2: x.planet1,
        planet1Owner: owner,
      };
    })
    .sort((a, b) => a.orb - b.orb);
};

export const getPlanet = (
  ctx: MultiWheelContextType,
  planet: PlanetName,
  owner: OwnerType = "main",
): PlanetAngle => {
  const angles =
    owner === "other" ? ctx.otherPlanetAngles : ctx.mainPlanetAngles;
  return angles.find((x) => x.name === planet)!;
};

export const getPlanetHouse = (
  ctx: MultiWheelContextType,
  planet: PlanetName,
  owner: OwnerType = "main",
): CuspType => {
  const angles =
    owner === "other" ? ctx.otherPlanetAngles : ctx.mainPlanetAngles;
  const cusps = owner === "other" ? ctx.otherCuspAngles : ctx.mainCuspAngles;

  for (let house = 1; house <= 12; house++) {
    const planetsInHouse = computePlanets(angles, cusps, house as CuspType);
    if (planetsInHouse.some((p) => p.name === planet)) {
      return house as CuspType;
    }
  }

  throw new Error(`House not found for planet ${planet} (owner: ${owner})`);
};

export const getMainOfOtherPlanet = (
  ctx: MultiWheelContextType,
  planet: PlanetName,
): { planetData: Planet; house: CuspType } => {
  for (let house = 1; house <= 12; house++) {
    const planetsInHouse = computePlanets(
      ctx.otherPlanetAngles,
      ctx.mainCuspAngles,
      house as CuspType,
    );
    const planetData = planetsInHouse.find((p) => p.name === planet);
    if (planetData) {
      return { planetData, house: house as CuspType };
    }
  }

  throw new Error(`House not found for planet ${planet} )`);
};

export const getHouse = (
  ctx: MultiWheelContextType,
  house: CuspType,
  owner: OwnerType = "main",
) => {
  const cusps = owner === "other" ? ctx.otherCuspAngles : ctx.mainCuspAngles;
  return cusps.find((x) => x.name === house)!;
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
  ctx: MultiWheelContextType,
  houseNum: CuspType,
  owner: OwnerType = "main",
) => {
  const house = getHouse(ctx, houseNum, owner);

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
  ctx: MultiWheelContextType,
  sign: ZodiacSign,
) => {
  const signAngle = ctx.signAngles.find((s) => s.sign === sign)!;

  if (ctx.settings.houseSystem === "whole_sign") {
    return [
      ctx.mainCuspAngles.filter(({ angle }) => angle === signAngle.angle),
      ctx.otherCuspAngles.filter(({ angle }) => angle === signAngle.angle),
    ];
  }

  return [
    ctx.mainCuspAngles.filter((house) => {
      return (
        inSign(house.angle, signAngle) ||
        inSign(house.endAngle, signAngle) ||
        (inHouse(signAngle.angle, house) &&
          inHouse((signAngle.angle + 30) % 360, house))
      );
    }),
    ctx.otherCuspAngles.filter((house) => {
      return (
        inSign(house.angle, signAngle) ||
        inSign(house.endAngle, signAngle) ||
        (inHouse(signAngle.angle, house) &&
          inHouse((signAngle.angle + 30) % 360, house))
      );
    }),
  ];
};

export const getSignInKeyAngle = (
  ctx: MultiWheelContextType,
  keyAngle: KeyType,
  owner: OwnerType = "main",
): ZodiacSign => {
  const keyAnglesArray =
    owner === "main" ? ctx.mainKeyAngles : ctx.otherKeyAngles;

  const angleObj = keyAnglesArray.find((ka) => ka.name === keyAngle)!;

  const signAngle = ctx.signAngles.find((s) => {
    return angleObj.angle >= s.angle && angleObj.angle < (s.angle + 30) % 360;
  })!;

  return signAngle.sign;
};

export const getFilteredAspects = (ctx: MultiWheelContextType): Aspect[] => {
  const aspectOptions = ctx.settings.aspectOptions;
  return ctx.aspects
    .filter(
      ({ type, orb }) =>
        aspectOptions[type].show && aspectOptions[type].minOrb >= orb,
    )
    .map((aspect) => ({ ...aspect, planet1Owner: "main" }));
};
