import type { Aspect, AspectPointType, AspectType } from "../../types/aspect";
import type { AspectMotion } from "../../types/aspect";
import type { Planet, PlanetBase } from "../../types/planet";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { useWheel } from "../useWheel";
import {
  getAspectRelationship,
  getChartSource,
  useGeneratedDescriptions,
  type PointPlacementContext,
} from "./useGeneratedDescriptions";
import type { KeyAngleDisplay } from "../../types/cusp";

export interface AspectDesc {
  description: string;
}

interface AspectDescParams {
  aspect: AspectType;
  point1: {
    type: AspectPointType;
    value: Planet | PlanetBase | KeyAngleDisplay;
  };
  point2: {
    type: AspectPointType;
    value: Planet | PlanetBase | KeyAngleDisplay;
  };
  orb?: number;
  motion?: AspectMotion;
  point1Owner?: OwnerType;
}

export const useAspectDesc = (params: AspectDescParams) => {
  const { type } = useWheel();
  const point1Owner = params.point1Owner ?? "main";
  const point2Owner =
    type === "transit" || type === "synastry"
      ? point1Owner === "main"
        ? "other"
        : "main"
      : point1Owner;
  const first = asPointPlacement(
    params.point1.type,
    params.point1.value,
    getChartSource(type, point1Owner),
  );
  const second = asPointPlacement(
    params.point2.type,
    params.point2.value,
    getChartSource(type, point2Owner),
  );
  const context =
    first && second
      ? {
          type: "aspect" as const,
          details: {
            relationship: getAspectRelationship(type),
            aspectType: params.aspect,
            first,
            second,
            orbDegrees: params.orb ?? null,
            motion: params.motion ?? null,
          },
        }
      : null;
  const { loading, descriptions } = useGeneratedDescriptions([context]);
  const aspectDesc: AspectDesc = { description: descriptions[0] ?? "" };

  return { loading, aspectDesc };
};

interface TimingAspectDescParams {
  aspect: Aspect;
  timeScale: "MOMENT" | "HOURLY" | "DAILY" | "LONG_TERM";
  relationship?: "NATAL" | "CURRENT" | "TRANSIT_TO_NATAL" | "SYNASTRY";
  firstOwner?: OwnerType;
  secondOwner?: OwnerType;
}

export const useTimingAspectDesc = (params: TimingAspectDescParams) => {
  const { type } = useWheel();
  const point1Owner = params.firstOwner ?? params.aspect.point1Owner ?? "main";
  const point2Owner =
    params.secondOwner ??
    (type === "transit" || type === "synastry"
      ? point1Owner === "main"
        ? "other"
        : "main"
      : point1Owner);
  const first = asPointPlacement(
    params.aspect.point1.type,
    params.aspect.point1.value,
    getChartSource(type, point1Owner),
  );
  const second = asPointPlacement(
    params.aspect.point2.type,
    params.aspect.point2.value,
    getChartSource(type, point2Owner),
  );
  const context =
    first && second
      ? {
          type: "timing" as const,
          timeScale: params.timeScale,
          event: {
            type: "aspect" as const,
            details: {
              relationship: params.relationship ?? getAspectRelationship(type),
              aspectType: params.aspect.type,
              first,
              second,
              orbDegrees: params.aspect.orb,
              motion: params.aspect.motion,
            },
          },
        }
      : null;
  const { loading, descriptions } = useGeneratedDescriptions([context]);

  return { loading, aspectDesc: { description: descriptions[0] ?? "" } };
};

export const asPointPlacement = (
  type: AspectPointType,
  value: Planet | PlanetBase | KeyAngleDisplay,
  chart: PointPlacementContext["chart"],
): PointPlacementContext => {
  if (type === "Angle") {
    const angle = value as KeyAngleDisplay;
    return {
      chart,
      point: { type: "keyAngle", name: angle.name },
      sign: angle.sign,
    };
  }

  const planet = value as Planet | PlanetBase;
  return {
    chart,
    point: { type: "planet", name: planet.name },
    sign: planet.sign,
    house: "house" in planet ? planet.house : null,
    retrograde: "retrograde" in planet ? planet.retrograde : null,
    stationary: "stationary" in planet ? planet.stationary : null,
  };
};
