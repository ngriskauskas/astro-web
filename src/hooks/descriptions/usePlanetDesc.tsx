import type { CuspType } from "../../types/cusp";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { Planet } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useWheel } from "../useWheel";
import { getChartSource, useGeneratedDescriptions } from "./useGeneratedDescriptions";

export interface PlanetDesc {
  retrograde?: string;
  sign: string;
  house: string;
  combined: string;
}

interface PlanetDescParams {
  planet: Planet;
  sign: ZodiacSign;
  house: CuspType;
  owner?: OwnerType;
}

export const usePlanetDesc = (params: PlanetDescParams) => {
  const { type } = useWheel();
  const chart = getChartSource(type, params.owner);
  const subject = {
    chart,
    point: { type: "planet" as const, name: params.planet.name },
    sign: params.sign,
    house: params.house,
    retrograde: params.planet.retrograde,
    stationary: params.planet.stationary,
  };
  const { loading, descriptions, error } = useGeneratedDescriptions([
    { type: "placement", subject: { ...subject, house: null } },
    { type: "placement", subject: { ...subject, sign: null } },
    { type: "placement", subject },
    params.planet.retrograde
      ? {
          type: "placement",
          subject: { ...subject, retrograde: true },
        }
      : null,
  ]);

  const [sign, house, combined, retrograde] = descriptions;
  const planetDesc: PlanetDesc = { sign, house, combined, retrograde };

  return { loading, error, planetDesc };
};
