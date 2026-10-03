import { useEffect, useState } from "react";
import type { AspectMotion, AspectType } from "../../types/aspect";
import type { CuspType, KeyType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import type { MultiWheelContextType } from "../../contexts/MultiWheelContext";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { apiFetch } from "../../utils/api";

export type ChartSource = "NATAL" | "CURRENT" | "TRANSIT" | "PRIMARY_NATAL" | "SECONDARY_NATAL";

export type WheelType = SingleWheelContextType["type"] | MultiWheelContextType["type"];

export interface PointPlacementContext {
  chart: ChartSource;
  point: { type: "planet"; name: PlanetName } | { type: "keyAngle"; name: KeyType };
  sign?: ZodiacSign | null;
  house?: CuspType | null;
  retrograde?: boolean | null;
  stationary?: boolean | null;
}

export type DescriptionMoonPhase =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export type DescriptionContext =
  | { type: "placement"; subject: PointPlacementContext }
  | {
      type: "aspect";
      details: {
        relationship: AspectRelationship;
        aspectType: AspectType;
        first: PointPlacementContext;
        second: PointPlacementContext;
        orbDegrees?: number | null;
        motion?: AspectMotion | null;
      };
    }
  | {
      type: "timing";
      timeScale: "MOMENT" | "HOURLY" | "DAILY" | "LONG_TERM";
      event:
        | {
            type: "ingress";
            planet: PlanetName;
            fromSign: ZodiacSign;
            toSign: ZodiacSign;
            chart?: ChartSource;
          }
        | { type: "retrograde"; planet: PlanetName; chart?: ChartSource }
        | { type: "station"; planet: PlanetName; retrograde: boolean; chart?: ChartSource }
        | {
            type: "aspect";
            details: {
              relationship: AspectRelationship;
              aspectType: AspectType;
              first: PointPlacementContext;
              second: PointPlacementContext;
              orbDegrees?: number | null;
              motion?: AspectMotion | null;
            };
          }
        | {
            type: "moonPhase";
            phase: DescriptionMoonPhase;
            chart?: ChartSource;
          };
    };

export type AspectRelationship = "NATAL" | "CURRENT" | "TRANSIT_TO_NATAL" | "SYNASTRY";

export const getChartSource = (type: WheelType, owner: "main" | "other" = "main"): ChartSource => {
  if (type === "natal") return "NATAL";
  if (type === "time" || type === "moment") return "CURRENT";
  if (type === "transit") return owner === "main" ? "PRIMARY_NATAL" : "TRANSIT";
  if (type === "synastry") return owner === "main" ? "PRIMARY_NATAL" : "SECONDARY_NATAL";
  return "CURRENT";
};

export const getAspectRelationship = (type: WheelType): AspectRelationship => {
  if (type === "natal") return "NATAL";
  if (type === "transit") return "TRANSIT_TO_NATAL";
  if (type === "synastry") return "SYNASTRY";
  return "CURRENT";
};

interface GenerateDescriptionResponse {
  description: string;
  cached: boolean;
  contextType: string;
}

// `error` is true when any of the descriptions could not be loaded.
export const useGeneratedDescriptions = (contexts: (DescriptionContext | null)[]) => {
  const [loading, setLoading] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const serializedContexts = JSON.stringify(contexts);

  useEffect(() => {
    const requestContexts = JSON.parse(serializedContexts) as (DescriptionContext | null)[];
    setError(false);
    if (!requestContexts.some(Boolean)) {
      setDescriptions(requestContexts.map(() => ""));
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setDescriptions(requestContexts.map(() => ""));

    Promise.all(
      requestContexts.map(async (context) => {
        if (!context) return "";

        try {
          const response = (await apiFetch("/descriptions", {
            method: "POST",
            body: JSON.stringify({ context }),
          })) as GenerateDescriptionResponse;
          return response.description ?? "";
        } catch {
          if (active) setError(true);
          return "";
        }
      }),
    )
      .then((results) => {
        if (active) setDescriptions(results);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serializedContexts]);

  return { loading, descriptions, error };
};
