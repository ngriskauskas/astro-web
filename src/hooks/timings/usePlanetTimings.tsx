import { useEffect, useState } from "react";
import type { CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import type { ZodiacSign } from "../../types/zodiac";
import { useWheelData } from "../chart/useWheelData";
import { useTransitPlanetDesc } from "../descriptions/useTransitPlanetDesc";
import { type AspectTiming } from "./useTimings";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { useWheel } from "../useWheel";
import { getLocalISODate } from "../../utils/funcs";

export const usePlanetTimings = ({ planet }: { planet: PlanetName }) => {
  const { loading, aspectTimings } = usePlanetAspectTimings(planet);

  const { loading: wheelLoading, getMainOfOtherPlanet } = useWheelData();

  const { house, planetData } = !wheelLoading
    ? getMainOfOtherPlanet!(planet)
    : {
        house: 1 as CuspType,
        planetData: { name: "sun" as PlanetName, sign: "aries" as ZodiacSign },
      };

  const { loading: descLoading, transitPlanetDesc } = useTransitPlanetDesc(
    {
      planet: planetData!.name,
      sign: planetData!.sign,
      house,
    },
    !wheelLoading,
  );

  const { loading: returnsLoading, planetReturns } = usePlanetReturns(planet);

  return {
    loading: loading || descLoading || wheelLoading || returnsLoading,
    house,
    planetAspects: aspectTimings!,
    planetData,
    transitPlanetDesc,
    planetReturns,
  };
};

export interface PlanetReturns {
  return: AspectTiming;
  opposition: AspectTiming;
}

export const usePlanetReturns = (
  planet: PlanetName,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(false);
  const [planetReturns, setPlanetReturns] = useState<PlanetReturns | null>(
    null,
  );
  const {
    settings: { profileId },
  } = useWheel();

  const { user } = useAuth();

  useEffect(() => {
    if (!enabled) return;

    const fetchReturns = async () => {
      setLoading(true);

      try {
        const data: PlanetReturns = await apiFetch("/timing/returns", {
          method: "POST",
          body: JSON.stringify({
            planet,
            date: getLocalISODate(),
            birth_profile_id: profileId,
            timezone: user?.timezone,
          }),
        });

        setPlanetReturns(data);
      } catch (err) {
        console.error("Failed to fetch planet returns", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [planet, profileId, user?.timezone, enabled]);

  return { loading, planetReturns };
};

export const usePlanetAspectTimings = (
  planet: PlanetName,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(false);
  const [aspectTimings, setAspectTimings] = useState<AspectTiming[] | null>(
    null,
  );
  const {
    settings: { profileId },
  } = useWheel();

  const { user } = useAuth();

  useEffect(() => {
    if (!enabled) return;

    const fetchReturns = async () => {
      setLoading(true);

      try {
        const data = await apiFetch("/timing/transit-planet", {
          method: "POST",
          body: JSON.stringify({
            planet,
            date: getLocalISODate(),
            birth_profile_id: profileId,
            timezone: user?.timezone,
          }),
        });

        setAspectTimings(data.aspects);
      } catch (err) {
        console.error("Failed to fetch planet returns", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [planet, profileId, user?.timezone, enabled]);

  return { loading, aspectTimings };
};
