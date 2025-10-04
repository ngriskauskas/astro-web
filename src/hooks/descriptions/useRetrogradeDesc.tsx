import { useState, useEffect } from "react";
import type { PlanetName } from "../../types/planet";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";

export interface RetrogradeDesc {
  description: string;
}

interface RetrogradeDescParams {
  planet: PlanetName;
}

export const useRetrogradeDesc = (
  params: RetrogradeDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [retrogradeDesc, setRetrogradeDesc] = useState<RetrogradeDesc>();

  const { type } = useWheel();

  useEffect(() => {
    if (!enabled) return;
    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/retrograde", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setRetrogradeDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.planet, type, enabled]);

  return { loading, retrogradeDesc };
};
