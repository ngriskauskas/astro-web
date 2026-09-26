import { useState, useEffect } from "react";
import type { AspectPointType, AspectType } from "../../types/aspect";
import type { PlanetBase } from "../../types/planet";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";
import type { KeyAngleDisplay } from "../../types/cusp";

export interface AspectDesc {
  description: string;
}

interface AspectDescParams {
  aspect: AspectType;
  point1: {
    type: AspectPointType;
    value: PlanetBase | KeyAngleDisplay;
  };
  point2: {
    type: AspectPointType;
    value: PlanetBase | KeyAngleDisplay;
  };
}

export const useAspectDesc = (params: AspectDescParams, enabled: boolean = true) => {
  const [loading, setLoading] = useState(false);
  const [aspectDesc, setAspectDesc] = useState<AspectDesc>({ description: "temp" });

  const { type } = useWheel();

  // useEffect(() => {
  //   if (!enabled) return;
  //   const fetchDesc = async () => {
  //     setLoading(true);
  //     const data = await apiFetch("/descriptions/aspect", {
  //       method: "POST",
  //       body: JSON.stringify({ ...params, type }),
  //     });
  //     setAspectDesc(data);
  //     setLoading(false);
  //   };

  //   fetchDesc();
  // }, [
  //   params.aspect,
  //   params.point1.value.name,
  //   params.point2.value.name,
  //   params.point1.value.sign,
  //   params.point2.value.sign,
  //   type,
  //   enabled,
  // ]);

  return { loading, aspectDesc };
};
