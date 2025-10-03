import { useState, useEffect } from "react";
import type { AspectType } from "../../types/aspect";
import type { PlanetBase } from "../../types/planet";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";
import type { KeyAngleDisplay } from "../../types/cusp";

export interface AspectDesc {
  description: string;
}

interface AspectDescParams {
  aspect: AspectType;
  planet1: PlanetBase | KeyAngleDisplay;
  planet2: PlanetBase | KeyAngleDisplay;
}

export const useAspectDesc = (
  params: AspectDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [aspectDesc, setAspectDesc] = useState<AspectDesc>();

  const { type } = useWheel();

  useEffect(() => {
    if (!enabled) return;
    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/aspect", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setAspectDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.aspect, params.planet1, params.planet2, type, enabled]);

  return { loading, aspectDesc };
};
